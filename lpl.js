// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
/**
 * @author  SongqianLi
 * @email   mail@lisongqian.cn
 * @datetime    2021-5-7 23:28:15
 * @type LPL比赛日程小组件
 */

// const fileName = "teamlist.js"
// const REQ = new Request(`http://lpl.lisongqian.cn/web201612/data/LOL_MATCH2_TEAM_LIST.js`);
// const RES = await REQ.load();
// const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
// FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), fileName), RES);

// 全局变量声明
const widget = new ListWidget()
const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color("#013d50"), new Color("#02597f")];
widget.backgroundGradient = gradient
const mainStack = widget.addStack()
mainStack.layoutVertically()
mainStack.centerAlignContent()

let teamList = {}
let competitionData = {}
let matchType = 0
let presentSize = "small"
if (config.runsInWidget) {
    presentSize = null
}
let imageSize = 30 // 图片的大小
let teamTxtWidth = 60 // 队名的容器宽度
let timeStrWidth = 60 // 比赛开始时间的容器宽度，比如："16:00"
if (config.widgetFamily === "small" || presentSize === "small") {
    imageSize = imageSize * 0.6
    teamTxtWidth = teamTxtWidth * 0.6
    timeStrWidth = timeStrWidth * 0.6
}
const teamNameFontSize = imageSize * 0.6 // 队名文本大小
const lineWidth = teamTxtWidth * 2 + imageSize * 2.5 + timeStrWidth
const dateStrWidth = 60 // 分割线中的日期的宽度
const dlineWidth = (lineWidth - dateStrWidth) / 2 // 分割线的左右两侧宽度比如 : ------2020-10-05------
const baseUrl = "http://lpl.lisongqian.cn/"
const upgrade = false
// 入口函数
let init = async () => {
    try {
        matchType = parseInt(args.widgetParameter.toString(), 10)
    } catch (e) {
        matchType = 152 // 2021 MSI
    }

    teamList = await loadTeamList()
    competitionData = await loadLolMatches()
    if (config.widgetFamily === "large" || presentSize === "large") {
        await renderLarge()
    } else if (config.widgetFamily === "medium" || presentSize === "medium") {
        await renderMedium()
    } else if (config.widgetFamily === "small" || presentSize === "small") {
        await renderSmall()
    }
    if (!config.runsInWidget) {
        if (presentSize === "large") {
            await widget.presentLarge()
        } else if (presentSize === "medium") {
            await widget.presentMedium()
        } else if (presentSize === "small") {
            await widget.presentSmall()
        }
        // Safari.open("https://huya.com/660000")
        if (upgrade)
            await downloadUpdate()
    }
}
init().then(() => {
    Script.setWidget(widget)
    Script.complete()
})


/***********************************************************
 * 以下为相关操作函数
 **********************************************************/

/**
 * url转换
 * @param url
 * @returns {string}
 */
function convertUrl(url) {
    let urlList = url.split("//")[1].split("/")
    // urlList.splice(0, 1)
    // return baseUrl + urlList.join("/")
    return "http://" + urlList.join("/")
}

/**
 * 获取队伍列表
 * @returns {Promise<any>}
 */
async function loadTeamList() {
    const req = new Request(
        baseUrl + "teamlist.js"
    )
    return req.loadJSON().then(res => {
        if (res.status == 0) {
            let newTeamList = {}
            for (let key in res.msg) {
                newTeamList[res.msg[key].TeamId] = res.msg[key]
            }
            return newTeamList
        } else
            return {}
    })

}

/**
 * 加载赛事数据
 * @returns {Promise<any>}
 */
async function loadLolMatches() {
    // "http://lpl.lisongqian.cn/web201612/data/LOL_MATCH2_MATCH_HOMEPAGE_BMATCH_LIST.js" //全部
    // "http://lpl.lisongqian.cn/web201612/data/LOL_MATCH2_MATCH_HOMEPAGE_BMATCH_LIST_148.js" // 2021春季赛
    let url = "http://lpl.lisongqian.cn/web201612/data/LOL_MATCH2_MATCH_HOMEPAGE_BMATCH_LIST_" + matchType + ".js"
    const req = new Request(url)
    return req.loadJSON().then(res => {
        if (res.status == 0)
            return res.msg
        return []
    })
}

/**
 * 渲染大号组件
 * @returns {Promise<void>}
 */
async function renderLarge() {
    let matches = [] // 要渲染的比赛数组
    let num = 5;
    for (var i = 0; i < competitionData.length; i++) {
        let val = competitionData[i]
        if (val.MatchStatus === "1" || val.MatchStatus === "2") // 未开始或进行中
        {
            break
        }
    }
    if (i > 0) {
        matches = competitionData.slice(i - 2, i - 2 + num)
    } else {
        matches = competitionData.slice(-num)
    }
    let matchImg = await getImageByUrl(baseUrl + "favicon.ico") // 赛事logo
    if (matchType === 152) {
        matchImg = await getImageByUrl(baseUrl + "msi-logo.png") // 赛事logo
    }
    const matchImageStack = mainStack.addStack()
    const matchImage = matchImageStack.addImage(matchImg)
    matchImage.imageSize = new Size(35, 35)
    await renderMatchList(matches)
}

/**
 * 渲染中号组件
 * @returns {Promise<void>}
 */
async function renderMedium() {
    let matches = [] // 要渲染的比赛数组
    let num = 2;
    for (var i = 0; i < competitionData.length; i++) {
        let val = competitionData[i]
        if (val.MatchStatus === "1" || val.MatchStatus === "2") // 未开始或进行中
        {
            break
        }
    }
    if (i > 0) {
        matches = competitionData.slice(i, i + num)
    } else {
        matches = competitionData.slice(-num)
    }
    // let matchImg = await getImageByUrl(baseUrl + "favicon.ico") // 赛事logo
    // if (matchType === 152)
    // {
    //     matchImg = await getImageByUrl(baseUrl + "msi-logo.png") // 赛事logo
    // }
    // const matchImg = await getImageByUrl(baseUrl + "favicon.ico") // 赛事logo
    // const matchImageStack = mainStack.addStack()
    // const matchImage = matchImageStack.addImage(matchImg)
    // matchImage.imageSize = new Size(35, 35)
    await renderMatchList(matches)
}

/**
 * 渲染小号组件
 * @returns {Promise<void>}
 */
async function renderSmall() {
    let matches = [] // 要渲染的比赛数组
    let num = 4;
    for (var i = 0; i < competitionData.length; i++) {
        let val = competitionData[i]
        if (val.MatchStatus === "1" || val.MatchStatus === "2") // 未开始或进行中
        {
            break
        }
    }
    if (i > 0) {
        matches = competitionData.slice(i - 1, i - 1 + num)
        for (let i = 0; i < matches.length; i++) {
            let val = matches[i]
            let team1 = teamList[val.TeamA] // 队伍1
            let team2 = teamList[val.TeamB] // 队伍2
            // 1. 加载资源
            // logo
            let team1Logo = await getImageByUrl(team1.TeamLogo)
            let team2Logo = await getImageByUrl(team2.TeamLogo)
            team1Logo.size = new Size(imageSize, imageSize)
            team2Logo.size = new Size(imageSize, imageSize)
            team1.score = val.ScoreA
            team2.score = val.ScoreB
            let container = mainStack.addStack()
            mainStack.addSpacer(6)
            // 2. 添加组件
            //队伍1
            let team1Stack = container.addStack()
            team1Stack.layoutVertically()
            const team1ImgStack = team1Stack.addStack()
            const team1TxtStack = team1Stack.addStack()
            const team1Img = team1ImgStack.addImage(team1Logo)
            const team1Txt = team1TxtStack.addText(team1.TeamName)
            team1ImgStack.size = new Size(teamTxtWidth, imageSize)
            team1TxtStack.size = new Size(teamTxtWidth, teamNameFontSize)

            // 比分
            let scoreStack = container.addStack()
            scoreStack.layoutVertically()
            const topScoreStack = scoreStack.addStack()
            const bottomScoreStack = scoreStack.addStack()
            topScoreStack.size = new Size(imageSize * 2.5, imageSize)
            bottomScoreStack.size = new Size(imageSize * 2.5, teamNameFontSize)
            bottomScoreStack.centerAlignContent()
            topScoreStack.centerAlignContent()
            if (val.MatchStatus === "1") { // 未开始
                const vsTxt = topScoreStack.addText("VS")
                vsTxt.font = Font.lightMonospacedSystemFont(imageSize * 0.9)
                vsTxt.textColor = Color.white()
            } else { // 进行中或已结束
                const team1ScoreStack = topScoreStack.addStack()
                const scoreDividerStack = topScoreStack.addStack()
                const team2ScoreStack = topScoreStack.addStack()
                team1ScoreStack.size = new Size(imageSize * 0.6, imageSize)
                scoreDividerStack.size = new Size(imageSize, imageSize)
                team2ScoreStack.size = new Size(imageSize * 0.6, imageSize)

                const team1ScoreTxt = team1ScoreStack.addText(team1.score.toString())
                const scoreDividerTxt = scoreDividerStack.addText(":")
                const team2ScoreTxt = team2ScoreStack.addText(team2.score.toString())

                const widgetTxts = [team1ScoreTxt, scoreDividerTxt, team2ScoreTxt]
                widgetTxts.forEach(item => {
                    item.centerAlignText()
                    item.font = Font.thinMonospacedSystemFont(imageSize)
                    item.textColor = Color.white()
                })

                if (team1.score > team2.score) {
                    team2ScoreTxt.textColor = Color.darkGray()
                } else if (team1.score < team2.score) {
                    team1ScoreTxt.textColor = Color.darkGray()
                }
            }
            let status = val.MatchStatus
            // 当前状态
            if (status === "3") {
                status = "已结束"
            } else if (status === "2") {
                status = "进行中"
            } else if (status === "1") {
                status = "未开始"
            }
            let statusTxt = bottomScoreStack.addText(status)
            // 队伍2
            let team2Stack = container.addStack()
            team2Stack.layoutVertically()
            const team2ImgStack = team2Stack.addStack()
            const team2TxtStack = team2Stack.addStack()
            const team2Img = team2ImgStack.addImage(team2Logo)
            const team2Txt = team2TxtStack.addText(team2.TeamName)
            team2ImgStack.size = new Size(teamTxtWidth, imageSize)
            team2TxtStack.size = new Size(teamTxtWidth, teamNameFontSize)

            // 字体颜色设置
            const widgetTxts = [team1Txt, team2Txt, statusTxt]
            widgetTxts.forEach(txt => {
                txt.centerAlignText()
                txt.font = Font.thinMonospacedSystemFont(teamNameFontSize)
                txt.textColor = Color.white()
            })
            if (val.MatchStatus === "2") {
                statusTxt.textColor = Color.green()
            } else if (val.MatchStatus === "3") {
                statusTxt.textColor = Color.darkGray()
            }
        }

    } else {
        const alertText = mainStack.addText("无进行中或未开始的比赛")
    }
}

/**
 * 渲染大中型组件的比赛列表-公共函数
 * @param matches
 * @returns {Promise<void>}
 */
async function renderMatchList(matches) {
    let lastDate = new Date(Date.parse(matches[0].MatchDate.replace(/-/g, "/")))
    for (let i = 0; i < matches.length; i++) {
        let val = matches[i]
        let team1 = teamList[val.TeamA] // 队伍1
        let team2 = teamList[val.TeamB] // 队伍2
        let matchScheduledAt = new Date(val.MatchDate.replace(/-/g, "/"))
        let timeStr = dateFormat("HH:MM", matchScheduledAt)
        if (i === 0 || matchScheduledAt.toLocaleDateString() !== lastDate.toLocaleDateString()) {
            addDivider(matchScheduledAt, lineWidth, 12, dlineWidth, dateStrWidth)
        }
        lastDate = matchScheduledAt
        // 1. 加载资源
        // logo
        let team1Logo = await getImageByUrl(team1.TeamLogo)
        let team2Logo = await getImageByUrl(team2.TeamLogo)
        team1Logo.size = new Size(imageSize, imageSize)
        team2Logo.size = new Size(imageSize, imageSize)
        team1.score = val.ScoreA
        team2.score = val.ScoreB
        let container = mainStack.addStack()
        mainStack.addSpacer(6)

        // 2. 添加组件
        // 时间显示
        let timeStrStack = container.addStack()
        let timeStrTxt = timeStrStack.addText(timeStr)
        timeStrStack.size = new Size(timeStrWidth, imageSize + teamNameFontSize)
        timeStrStack.layoutVertically()
        timeStrStack.centerAlignContent()
        timeStrTxt.font = Font.lightMonospacedSystemFont(imageSize * 0.7)
        timeStrTxt.textColor = Color.white()

        //队伍1
        let team1Stack = container.addStack()
        team1Stack.layoutVertically()
        const team1ImgStack = team1Stack.addStack()
        const team1TxtStack = team1Stack.addStack()
        const team1Img = team1ImgStack.addImage(team1Logo)
        const team1Txt = team1TxtStack.addText(team1.TeamName)
        team1ImgStack.size = new Size(teamTxtWidth, imageSize)
        team1TxtStack.size = new Size(teamTxtWidth, teamNameFontSize)

        // 比分
        let scoreStack = container.addStack()
        scoreStack.layoutVertically()
        const topScoreStack = scoreStack.addStack()
        const bottomScoreStack = scoreStack.addStack()
        topScoreStack.size = new Size(imageSize * 2.5, imageSize)
        bottomScoreStack.size = new Size(imageSize * 2.5, teamNameFontSize)
        bottomScoreStack.centerAlignContent()
        topScoreStack.centerAlignContent()
        if (val.MatchStatus === "1") { // 未开始
            const vsTxt = topScoreStack.addText("VS")
            vsTxt.font = Font.lightMonospacedSystemFont(imageSize * 0.9)
            vsTxt.textColor = Color.white()
        } else { // 进行中或已结束
            const team1ScoreStack = topScoreStack.addStack()
            const scoreDividerStack = topScoreStack.addStack()
            const team2ScoreStack = topScoreStack.addStack()
            team1ScoreStack.size = new Size(imageSize * 0.6, imageSize)
            scoreDividerStack.size = new Size(imageSize, imageSize)
            team2ScoreStack.size = new Size(imageSize * 0.6, imageSize)

            const team1ScoreTxt = team1ScoreStack.addText(team1.score.toString())
            const scoreDividerTxt = scoreDividerStack.addText(":")
            const team2ScoreTxt = team2ScoreStack.addText(team2.score.toString())

            const widgetTxts = [team1ScoreTxt, scoreDividerTxt, team2ScoreTxt]
            widgetTxts.forEach(item => {
                item.centerAlignText()
                item.font = Font.thinMonospacedSystemFont(imageSize)
                item.textColor = Color.white()
            })

            if (team1.score > team2.score) {
                team2ScoreTxt.textColor = Color.darkGray()
            } else if (team1.score < team2.score) {
                team1ScoreTxt.textColor = Color.darkGray()
            }
        }
        let status = val.MatchStatus
        // 当前状态
        if (status === "3") {
            status = "已结束"
        } else if (status === "2") {
            status = "进行中"
        } else if (status === "1") {
            status = "未开始"
        }
        let statusTxt = bottomScoreStack.addText(status)

        // 队伍2
        let team2Stack = container.addStack()
        team2Stack.layoutVertically()
        const team2ImgStack = team2Stack.addStack()
        const team2TxtStack = team2Stack.addStack()
        const team2Img = team2ImgStack.addImage(team2Logo)
        const team2Txt = team2TxtStack.addText(team2.TeamName)
        team2ImgStack.size = new Size(teamTxtWidth, imageSize)
        team2TxtStack.size = new Size(teamTxtWidth, teamNameFontSize)

        // 字体颜色设置
        const widgetTxts = [team1Txt, team2Txt, statusTxt]
        widgetTxts.forEach(txt => {
            txt.centerAlignText()
            txt.font = Font.thinMonospacedSystemFont(teamNameFontSize)
            txt.textColor = Color.white()
        })

        if (val.MatchStatus === "2") {
            statusTxt.textColor = Color.green()
        } else if (val.MatchStatus === "3") {
            statusTxt.textColor = Color.darkGray()
        }
    }

}

/**
 * 图片缓存到本地
 * @param {string} imageUrl : 图片URL
 */
async function loadImage(imageUrl) {
    const fm = FileManager.local()
    let splitList = imageUrl.split("//")[1].split("/")
    const path = fm.documentsDirectory() + splitList[splitList.length - 2]

    const temp = imageUrl.split("/")
    const filename = temp[temp.length - 1]
    fm.createDirectory(path.split(filename)[0], true)
    if (!fm.fileExists(path)) {
        const img = await new Request(imageUrl).loadImage()
        fm.writeImage(path, img)
        return img
    } else {
        return fm.readImage(path)
    }
}

/**
 * 获取图片并缓存
 * @param url 图片url
 * @param useCache 是否缓存图片
 * @returns {Promise<*|*>}
 */
async function getImageByUrl(url, useCache = true) {
    url = convertUrl(url)
    const cacheKey = md5(url)
    const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey)
    // 判断是否有缓存
    if (useCache && FileManager.local().fileExists(cacheFile)) {
        return Image.fromFile(cacheFile)
    }
    try {
        const img = await new Request(url).loadImage()
        // 存储到缓存
        FileManager.local().writeImage(cacheFile, img)
        return img
    } catch (e) {
        console.log(e)
        // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
        let ctx = new DrawContext()
        ctx.size = new Size(100, 100)
        ctx.setFillColor(Color.red())
        ctx.fillRect(new Rect(0, 0, 100, 100))
        return await ctx.getImage()
    }
}

function md5(str) {
    function d(n, t) {
        var r = (65535 & n) + (65535 & t);
        return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r
    }

    function f(n, t, r, e, o, u) {
        return d((c = d(d(t, n), d(e, u))) << (f = o) | c >>> 32 - f, r);
        var c, f
    }

    function l(n, t, r, e, o, u, c) {
        return f(t & r | ~t & e, n, t, o, u, c)
    }

    function v(n, t, r, e, o, u, c) {
        return f(t & e | r & ~e, n, t, o, u, c)
    }

    function g(n, t, r, e, o, u, c) {
        return f(t ^ r ^ e, n, t, o, u, c)
    }

    function m(n, t, r, e, o, u, c) {
        return f(r ^ (t | ~e), n, t, o, u, c)
    }

    function i(n, t) {
        var r, e, o, u;
        n[t >> 5] |= 128 << t % 32, n[14 + (t + 64 >>> 9 << 4)] = t;
        for (var c = 1732584193, f = -271733879, i = -1732584194, a = 271733878, h = 0; h < n.length; h += 16) c = l(r = c, e = f, o = i, u = a, n[h], 7, -680876936), a = l(a, c, f, i, n[h + 1], 12, -389564586), i = l(i, a, c, f, n[h + 2], 17, 606105819), f = l(f, i, a, c, n[h + 3], 22, -1044525330), c = l(c, f, i, a, n[h + 4], 7, -176418897), a = l(a, c, f, i, n[h + 5], 12, 1200080426), i = l(i, a, c, f, n[h + 6], 17, -1473231341), f = l(f, i, a, c, n[h + 7], 22, -45705983), c = l(c, f, i, a, n[h + 8], 7, 1770035416), a = l(a, c, f, i, n[h + 9], 12, -1958414417), i = l(i, a, c, f, n[h + 10], 17, -42063), f = l(f, i, a, c, n[h + 11], 22, -1990404162), c = l(c, f, i, a, n[h + 12], 7, 1804603682), a = l(a, c, f, i, n[h + 13], 12, -40341101), i = l(i, a, c, f, n[h + 14], 17, -1502002290), c = v(c, f = l(f, i, a, c, n[h + 15], 22, 1236535329), i, a, n[h + 1], 5, -165796510), a = v(a, c, f, i, n[h + 6], 9, -1069501632), i = v(i, a, c, f, n[h + 11], 14, 643717713), f = v(f, i, a, c, n[h], 20, -373897302), c = v(c, f, i, a, n[h + 5], 5, -701558691), a = v(a, c, f, i, n[h + 10], 9, 38016083), i = v(i, a, c, f, n[h + 15], 14, -660478335), f = v(f, i, a, c, n[h + 4], 20, -405537848), c = v(c, f, i, a, n[h + 9], 5, 568446438), a = v(a, c, f, i, n[h + 14], 9, -1019803690), i = v(i, a, c, f, n[h + 3], 14, -187363961), f = v(f, i, a, c, n[h + 8], 20, 1163531501), c = v(c, f, i, a, n[h + 13], 5, -1444681467), a = v(a, c, f, i, n[h + 2], 9, -51403784), i = v(i, a, c, f, n[h + 7], 14, 1735328473), c = g(c, f = v(f, i, a, c, n[h + 12], 20, -1926607734), i, a, n[h + 5], 4, -378558), a = g(a, c, f, i, n[h + 8], 11, -2022574463), i = g(i, a, c, f, n[h + 11], 16, 1839030562), f = g(f, i, a, c, n[h + 14], 23, -35309556), c = g(c, f, i, a, n[h + 1], 4, -1530992060), a = g(a, c, f, i, n[h + 4], 11, 1272893353), i = g(i, a, c, f, n[h + 7], 16, -155497632), f = g(f, i, a, c, n[h + 10], 23, -1094730640), c = g(c, f, i, a, n[h + 13], 4, 681279174), a = g(a, c, f, i, n[h], 11, -358537222), i = g(i, a, c, f, n[h + 3], 16, -722521979), f = g(f, i, a, c, n[h + 6], 23, 76029189), c = g(c, f, i, a, n[h + 9], 4, -640364487), a = g(a, c, f, i, n[h + 12], 11, -421815835), i = g(i, a, c, f, n[h + 15], 16, 530742520), c = m(c, f = g(f, i, a, c, n[h + 2], 23, -995338651), i, a, n[h], 6, -198630844), a = m(a, c, f, i, n[h + 7], 10, 1126891415), i = m(i, a, c, f, n[h + 14], 15, -1416354905), f = m(f, i, a, c, n[h + 5], 21, -57434055), c = m(c, f, i, a, n[h + 12], 6, 1700485571), a = m(a, c, f, i, n[h + 3], 10, -1894986606), i = m(i, a, c, f, n[h + 10], 15, -1051523), f = m(f, i, a, c, n[h + 1], 21, -2054922799), c = m(c, f, i, a, n[h + 8], 6, 1873313359), a = m(a, c, f, i, n[h + 15], 10, -30611744), i = m(i, a, c, f, n[h + 6], 15, -1560198380), f = m(f, i, a, c, n[h + 13], 21, 1309151649), c = m(c, f, i, a, n[h + 4], 6, -145523070), a = m(a, c, f, i, n[h + 11], 10, -1120210379), i = m(i, a, c, f, n[h + 2], 15, 718787259), f = m(f, i, a, c, n[h + 9], 21, -343485551), c = d(c, r), f = d(f, e), i = d(i, o), a = d(a, u);
        return [c, f, i, a]
    }

    function a(n) {
        for (var t = "", r = 32 * n.length, e = 0; e < r; e += 8) t += String.fromCharCode(n[e >> 5] >>> e % 32 & 255);
        return t
    }

    function h(n) {
        var t = [];
        for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1) t[e] = 0;
        for (var r = 8 * n.length, e = 0; e < r; e += 8) t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32;
        return t
    }

    function e(n) {
        for (var t, r = "0123456789abcdef", e = "", o = 0; o < n.length; o += 1) t = n.charCodeAt(o), e += r.charAt(t >>> 4 & 15) + r.charAt(15 & t);
        return e
    }

    function r(n) {
        return unescape(encodeURIComponent(n))
    }

    function o(n) {
        return a(i(h(t = r(n)), 8 * t.length));
        var t
    }

    function u(n, t) {
        return function (n, t) {
            var r, e, o = h(n), u = [], c = [];
            for (u[15] = c[15] = void 0, 16 < o.length && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1) u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r];
            return e = i(u.concat(h(t)), 512 + 8 * t.length), a(i(c.concat(e), 640))
        }(r(n), r(t))
    }

    function t(n, t, r) {
        return t ? r ? u(t, n) : e(u(t, n)) : r ? o(n) : e(o(n))
    }

    return t(str)
}

/**
 * 获取周（周一、周二、周三....）
 * @param {Date} date :
 */
function getDay(date) {
    const dayMap = {
        0: "周日",
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六"
    }
    return dayMap[date.getDay()]
}

/**
 * 时间格式化
 * @param {string} fmt :模板字符串 : "YYYY-mm-dd HH:MM"
 * @param {Date} date :Date对象
 */
function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString() // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
        ;
    }
    ;
    return fmt;
}

/**
 * 渲染日期分割线左右侧的线条
 * @param {*} dividerStack : 分割线容器
 * @param {*} dividerLineWidth : 分割线宽度
 * @param {*} dividerLineHeight : 分割线高度
 */
function addDividerLine(dividerStack, dividerLineWidth, dividerLineHeight) {
    const sideDividerStack = dividerStack.addStack()
    sideDividerStack.size = new Size(dividerLineWidth, dividerLineHeight)
    sideDividerStack.layoutVertically()
    sideDividerStack.addStack().size = new Size(dividerLineWidth, Math.floor(dividerLineHeight / 2) - 1)
    const sideDivider = sideDividerStack.addStack()
    sideDivider.size = new Size(dividerLineWidth, 1)
    sideDivider.backgroundColor = Color.white()
}

/**
 * 渲染日期分割线
 * @param {Date} date : 日期对象
 * @param {number} dividerWidth : 分割线宽度
 * @param {number} dividerHeight : 分割线高度
 * @param {number} dividerLineWidth : 分割线左右侧线条的宽度
 * @param {number} dividerTxtWidth : 分割线中的日期文本的宽度
 */
function addDivider(date, dividerWidth, dividerHeight, dividerLineWidth, dividerTxtWidth) {
    const day = getDay(date)
    const dividerStack = mainStack.addStack()
    // 渲染左侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight)
    // 日期文本容器
    const dividerTxtStack = dividerStack.addStack()
    // 渲染右侧分割线
    addDividerLine(dividerStack, dividerLineWidth, dividerHeight)
    // 渲染日期文本
    dividerStack.size = new Size(dividerWidth, dividerHeight)
    dividerTxtStack.size = new Size(dividerTxtWidth, dividerHeight)
    const dividerTxt = dividerTxtStack.addText(day)
    dividerTxt.font = Font.lightMonospacedSystemFont(dividerHeight - 1)
    dividerTxt.textColor = Color.white()
}


/**
 * 下载更新
 * @returns {Promise<void>}
 */
async function downloadUpdate() {
    let files = FileManager.local()
    const iCloudInUse = files.isFileStoredIniCloud(module.filename)
    files = iCloudInUse ? FileManager.iCloud() : files
    let message = ''
    try {
        let downloadURL = "https://raw.githubusercontent.com/lisongqian/Scriptable/master/lpl.js"
        const req = new Request(downloadURL)
        const codeString = await req.loadString()
        files.writeString(module.filename, codeString)
        message = "脚本已更新，请退出脚本重新进入运行生效。"
    } catch {
        message = "更新失败，请稍后再试。"
    }
    const options = ["好的"]
    await this.generateAlert(message, options)
    Script.complete()
}



