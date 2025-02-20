#!/usr/bin/env node

// @name: index.js
// @description: 项目入口文件
// @author: ZhonFortune
// @date: 2024-12-15

// Code >>

// 引入库
const https = require('https');
const express = require('express');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const childProcess = require('child_process');

// 检查目录文件
// @dependencies: fs, path
// @folder:
// ├── config
// │   └── temp
// │       └── onotice.json
// │       └── token.json
// │   └── server.json
// │   └── opp.json
// ├── logs

// 判断config
if (!fs.existsSync(path.join(__dirname, './config/temp/onotice.json')) || !fs.existsSync(path.join(__dirname, './config/temp/token.json'))) {
    // 如果不存在则创建
    fs.mkdirSync(path.join(__dirname, './config/temp'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, './config/temp/onotice.json'), JSON.stringify({noticeList: []}), 'utf-8');
    console.log('【config】onotice.json 创建成功');
    fs.writeFileSync(path.join(__dirname, './config/temp/token.json'), JSON.stringify({tokenList: []}), 'utf-8');
} if (!fs.existsSync(path.join(__dirname, './config/server.json')) || !fs.existsSync(path.join(__dirname, './config/opp.json'))) {
    // 如果不存在则创建
    fs.mkdirSync(path.join(__dirname, './config'), { recursive: true });
    const serverJson = {
        "host": "127.0.0.1",
        "port": "5080",
        "open": false
    }
    const oppJson = {
        "overview": {
            "name": "总览",
            "id": "overview",
            "path": "overview.html"
        },
        "notice": {
            "name": "通知列表",
            "id": "notice",
            "path": "notice.html"
        },
        "calendar": {
            "name": "日历",
            "id": "calendar",
            "path": "calendar.html"
        },
        "database": {
            "name": "数据库",
            "id": "database",
            "path": "database.html"
        },
        "api": {
            "name": "接口",
            "id": "api",
            "path": "api.html"
        },
        "account": {
            "name": "账户",
            "id": "account",
            "path": "account.html"
        },
        "about": {
            "name": "关于",
            "id": "about",
            "path": "about.html"
        }
    }
    fs.writeFileSync(path.join(__dirname, './config/server.json'), JSON.stringify(serverJson), 'utf-8');
    fs.writeFileSync(path.join(__dirname, './config/opp.json'), JSON.stringify(oppJson), 'utf-8');
} if (!fs.existsSync(path.join(__dirname, './logs'))) {
    // 如果不存在则创建
    fs.mkdirSync(path.join(__dirname, './logs'));
}

// 日志记录器
// @dependencies: 用于存储日志文件
// @folder: logs
// @function: addLogOperation()

// 首先生成一个日志文件(年月日+时间戳.log)
const NowlogPath = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getTime()}.log`
fs.writeFileSync(path.join(__dirname, './logs/' + NowlogPath), '', 'utf-8');
// 清除所有临时文件内容
fs.writeFileSync(path.join(__dirname, './config/temp/onotice.json'), JSON.stringify({noticeList: []}), 'utf-8');
fs.writeFileSync(path.join(__dirname, './config/temp/token.json'), JSON.stringify({tokenList: []}), 'utf-8');
function addLogOperation(operaction,data) {
    // 检查logs文件夹是否存在
    if (fs.existsSync(path.join(__dirname, './logs/' + NowlogPath))) {
        // 如果存在则追加日志
        // 日志格式: [${time}]: ${operation} - ${data}
        fs.appendFileSync(path.join(__dirname, './logs/' + NowlogPath), `[${new Date().toLocaleString()}]: ${operaction} - ${data}\n`, 'utf-8');
    }else {
        // 不存在则创建然后重新调用函数
        fs.mkdirSync(path.join(__dirname, './logs' + NowlogPath));
        addLogOperation(operaction,data);
    }
}
// 创建服务器
// @dependencies: express, cors

// 创建express实例
var app = express();
var staticPath = path.join(__dirname, '/static/');
app.use(cors(), express.json(), express.static(staticPath));

// 设置跨域
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 读取服务器配置
var configServerPath = path.join(__dirname, './config/server.json');
var configServerTemp = JSON.parse(fs.readFileSync(configServerPath, 'utf-8', (err, data) => {
    if (data) {
        // 读取成功则将数据赋值给configServerTemp
        return data;
    } else if (err) {
        // 读取失败则输出错误信息
        console.log(err);
    } else {
        // 读取失败则输出错误信息
        console.log('服务器配置文件读取失败');
    }
}));

// 应用服务器配置
const serverHost = configServerTemp.host;
const serverPort = configServerTemp.port;
const serverOpen = configServerTemp.open;
if (serverPort == '' || serverPort == undefined) {
    // 检查Port是否为空 以及 Port是否合法
    console.log('');
    console.log('项目启动失败');
    console.log('【服务器配置】Port不能为空');
    console.log('');
} else if (serverPort < 0 || serverPort > 65535) {
    // 检查Port是否合法
    console.log('');
    console.log('项目启动失败');
    console.log('【服务器配置】Port必须在0-65535之间');
    console.log('');
} else {
    // 均合法则监听端口
    app.listen(serverPort, serverHost, () => {
        console.log(``)
        console.log(`服务器已启动 监听端口 ${serverPort} `);
        console.log(`服务器已启动 运行于 http://${serverHost}:${serverPort} `);
        console.log(``)
        console.log(`浏览器自启动: ${serverOpen}`);
        console.log(``)
        if (serverOpen == true) {
            // 如果配置文件中open为true则自动打开浏览器
            childProcess.exec(`start http://${serverHost}:${serverPort}`, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                } else {
                    // 不做任何操作
                }
            });
        } else {
            // 不做任何操作
        }
    })
    // 写入日志
    addLogOperation('Start', `Server On ${serverHost}:${serverPort}`);
    addLogOperation('Start', `BrowserOpen: ${serverOpen}`);
}

// API接口
// @dependencies: axios, CryptoJS , express , cors
// 初始化所有接口
app.get('/', (req, res) => { })
addLogOperation('Service', `API Service initation has been done`);

// loadpage 接口
// @url: /api/loadpage
// @description: 加载操作页面
// @method: POST
app.post('/api/loadpage', (req, res) => {
    const reqId = req.body.id;
    // 检查配置文件是否存在
    var configLoadpagePath = path.join(__dirname, './config/opp.json');
    if (fs.existsSync(configLoadpagePath)) {
        // 配置文件存在则读取配置文件
        var configLoadpageTemp = JSON.parse(fs.readFileSync(configLoadpagePath, 'utf-8', (err, data) => {
            if (data) {
                // 读取成功则将数据赋值给configLoadpageTemp
                return data;
            } else {
                // 读取失败则返回错误信息
                res.send({ code: 500, status: 'error', message: '配置文件 [opp.json] 读取失败' })
            }
        }))
        // 检查配置文件中是否存在该id 且配置中是否有合法的path
        if (configLoadpageTemp[reqId] && configLoadpageTemp[reqId].path) {
            var loadpageHtmlPath = path.join(__dirname, './views/panel-operaction/' + configLoadpageTemp[reqId].path);
            // 检查HTML文件是否存在
            if (fs.existsSync(loadpageHtmlPath)) {
                // HTML文件存在则读取HTML文件的内容并直接返回文本
                res.send(fs.readFileSync(loadpageHtmlPath, 'utf-8', (err, data) => {
                    if (data) {
                        // 读取成功则将数据赋值给configLoadpageTemp
                        return data;
                    } else {
                        // 读取失败则返回错误信息
                        res.send({ code: 500, status: 'error', message: reqId + '.html 操作页面 读取失败' })
                    }
                }))
                addLogOperation('LoadPage', `Loadpage { ${reqId} } success`);
            } else {
                // HTML文件不存在则返回错误信息
                res.send({ code: 404, status: 'error', message: reqId + '.html 操作页面 不存在' })
                addLogOperation('LoadPage', `Loadpage { ${reqId} } failed (HTML file not found)`);
            }
        } else {
            // 配置文件中不存在该id 或 配置中无合法的path
            res.send({ code: 404, status: 'error', message: '配置文件 [opp.json] 中不存在该id 或 配置中无合法的path' })
            addLogOperation('LoadPage', `Loadpage { ${reqId} } failed (ID not found or path not found)`);
        }
    } else if (!fs.existsSync(configLoadpagePath)) {
        // 配置文件不存在 则 返回错误信息
        res.send({ code: 404, status: 'error', message: '配置文件 [opp.json] 不存在' })
        addLogOperation('LoadPage', `Loadpage { ${reqId} } failed (opp.json not found)`);
    } else {
        // 未知错误
        res.send({ code: 500, status: 'error', message: '未知错误' })
        addLogOperation('LoadPage', `Loadpage { ${reqId} } failed (Unknown error)`);
    }
})

// checktokenisexist 接口
// @url: /api/checktokenisexist
// @description: 查询token是否存在
// @method: get
var configTokenPath = path.join(__dirname, './config/temp/token.json');
app.post('/api/token/check', (req, res) => {
    const reqToken = CryptoJS.MD5(req.body.token).toString();
    console.log(`token: ${reqToken}`)
    addLogOperation('Token',`Receive Token request: ${reqToken}`)
    // 检查配置文件的tokenList数组是否存在该token
    if (fs.existsSync(configTokenPath)) {
        // 开始检索token
        var configTokenTemp = JSON.parse(fs.readFileSync(configTokenPath, 'utf-8', (err, data) => {
            if (data) {
                // 读取成功则将数据赋值给configTokenTemp
                return data;
            }
        }))
        if (configTokenTemp.tokenList.indexOf(reqToken) !== -1) {
            // 存在则返回true
            addLogOperation('Token',`Token: ${reqToken} has existed (Reject used)`)
            res.send({ code: 200, status: 'success', message: `${req.body.token} 已重复 已被禁止`, data: { isexist: "true" } })
        } else {
            // 不存在则将token写入到配置文件的tokenList数组中并返回false
            configTokenTemp.tokenList.push(reqToken);
            fs.writeFileSync(configTokenPath, JSON.stringify(configTokenTemp, null, 4));
            addLogOperation('Token',`Token: ${reqToken} not exist (Allow used)`)
            res.send({ code: 200, status: 'success', message: `${req.body.token} 已被允许`, data: { isexist: "false", token: CryptoJS.MD5(req.body.token).toString() } })
        }
    }
})

// notice 接口
// @url: /api/overview/notice/get && /api/overview/notice/new
// @description: 在总览面板的通知列表显示提示消息
// @method: get&post
const configONoticePath = path.join(__dirname, './config/temp/onotice.json');
app.post('/api/overview/notice/new', (req, res) => {
    const type = req.body.type;
    const text = req.body.text;
    const subt = req.body.subt;
    const token = req.body.token;
    addLogOperation('Notice New',`Receive Notice request { ${type.text} ${type.color} ${text} ${subt} ${token} }`)
    // 检查配置文件是否存在
    if (fs.existsSync(configONoticePath)) {
        // 配置文件存在则将数据追加到配置文件的noticeList数组中
        var configONoticeTemp = JSON.parse(fs.readFileSync(configONoticePath, 'utf-8', (err, data) => {
            if (data) {
                // 读取成功则将数据赋值给configONoticeTemp
                return data;
            }
        }))
        configONoticeTemp.noticeList.push({ type, text, subt, token });
        fs.writeFileSync(configONoticePath, JSON.stringify(configONoticeTemp, null, 4));
        // 返回成功信息
        res.send({ code: 200, status: 'success', message: '通知已添加', data: { type, text, subt, token } });
        addLogOperation('Notice New',`Notice { ${type.text} ${type.color} ${text} ${subt} ${token} } has been added`)
    } else {
        // 配置文件不存在则返回错误信息
        res.send({ code: 404, status: 'error', message: '配置文件不存在', data: { type, text, subt, token } });
        addLogOperation('Notice New',`Notice { ${type.text} ${type.color} ${text} ${subt} ${token} } has not been added (Config file not exist)`)
    }
})
app.get('/api/overview/notice/get', (req, res) => {
    addLogOperation('Notice Get',`Receive Notice get request`)
    // 检查配置文件是否存在
    if (fs.existsSync(configONoticePath)) {
        // 配置文件存在则将读取配置文件的内容并返回
        const configONoticeTemp = JSON.parse(fs.readFileSync(configONoticePath, 'utf-8'));
        res.send({ code: 200, status: 'success', message: '通知已获取', data: configONoticeTemp.noticeList, length: configONoticeTemp.noticeList.length });
        addLogOperation('Notice Get',`Notice return success`)
    } else {
        // 配置文件不存在则返回错误信息
        res.send({ code: 404, status: 'error', message: '配置文件不存在' });
        addLogOperation('Notice Get',`Notice return failed (Config file not exist)`)
    }
})
