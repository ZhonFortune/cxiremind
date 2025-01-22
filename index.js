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

// 创建服务器
// @dependencies: express, cors

    // 创建express实例
    var app = express();
    var staticPath = path.join(__dirname, '/static/');
    app.use(cors(),express.json(),express.static(staticPath));

    // 设置跨域
    app.use((req,res,next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    // 读取服务器配置
    var configServerPath = path.join(__dirname, './config/server.json');
    var configServerTemp = JSON.parse(fs.readFileSync(configServerPath, 'utf-8' , (err, data) => {
        if (data) {
            // 读取成功则将数据赋值给configServerTemp
            return data;
        }else if (err) {
            // 读取失败则输出错误信息
            console.log(err);
        }else {
            // 读取失败则输出错误信息
            console.log('服务器配置文件读取失败');
        }
    }));

    // 应用服务器配置
    const serverHost = configServerTemp.host;
    const serverPort  = configServerTemp.port;
    const serverOpen = configServerTemp.open;
    if (serverPort == '' || serverPort == undefined) {
        // 检查Port是否为空 以及 Port是否合法
        console.log('');
        console.log('项目启动失败');
        console.log('【服务器配置】Port不能为空');
        console.log('');
    }else if (serverPort < 0 || serverPort > 65535) {
        // 检查Port是否合法
        console.log('');
        console.log('项目启动失败');
        console.log('【服务器配置】Port必须在0-65535之间');
        console.log('');
    }else {
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
                    }else {
                        // 不做任何操作
                    }
                });
            }else {
                // 不做任何操作
            }
        })
    }

// API接口
// @dependencies: axios, CryptoJS , express , cors

// 初始化所有接口
app.get('/', (req, res) => {})

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
            var configLoadpageTemp = JSON.parse(fs.readFileSync(configLoadpagePath, 'utf-8' , (err, data) => {
                if (data) {
                    // 读取成功则将数据赋值给configLoadpageTemp
                    return data;
                }else {
                    // 读取失败则返回错误信息
                    res.send({code: 500,status: 'error',message: '配置文件 [opp.json] 读取失败'})
                }
            }))
            // 检查配置文件中是否存在该id 且配置中是否有合法的path
            if (configLoadpageTemp[reqId] && configLoadpageTemp[reqId].path) {
                var loadpageHtmlPath = path.join(__dirname,'./views/panel-operaction/' + configLoadpageTemp[reqId].path);
                // 检查HTML文件是否存在
                if (fs.existsSync(loadpageHtmlPath)) {
                    // HTML文件存在则读取HTML文件的内容并直接返回文本
                    res.send(fs.readFileSync(loadpageHtmlPath, 'utf-8' , (err, data) => {
                        if (data) {
                            // 读取成功则将数据赋值给configLoadpageTemp
                            return data;
                        }else {
                            // 读取失败则返回错误信息
                            res.send({code: 500,status: 'error',message: reqId + '.html 操作页面 读取失败'})
                        }
                    }))
                } else {
                    // HTML文件不存在则返回错误信息
                    res.send({code: 404,status: 'error',message: reqId + '.html 操作页面 不存在'})
                }
            }else {
                // 配置文件中不存在该id 或 配置中无合法的path
                res.send({code: 404,status: 'error',message: '配置文件 [opp.json] 中不存在该id 或 配置中无合法的path'})
            }
        }else if(! fs.existsSync(configLoadpagePath)) {
            // 配置文件不存在 则 返回错误信息
            res.send({code: 404,status: 'error',message: '配置文件 [opp.json] 不存在'})
        }else {
            // 未知错误
            res.send({code: 500,status: 'error',message: '未知错误'})
        }
    })

    // checktokenisexist 接口
    // @url: /api/checktokenisexist
    // @description: 查询token是否存在
    // @method: get
    var configTokenPath = path.join(__dirname, './config/temp/token.json');
    app.post('/api/checktokenisexist', (req, res) => {
        const reqToken = CryptoJS.MD5(req.body.token).toString();
        console.log(`token: ${reqToken}`)
        // 检查配置文件的tokenList数组是否存在该token
        if (fs.existsSync(configTokenPath)) {
            // 开始检索token
            var configTokenTemp = JSON.parse(fs.readFileSync(configTokenPath, 'utf-8' , (err, data) => {
                if (data) {
                    // 读取成功则将数据赋值给configTokenTemp
                    return data;
                }
            }))
            if (configTokenTemp.tokenList.indexOf(reqToken) !== -1) {
                // 存在则返回true
                res.send({ code: 200, status: 'success', message: `${req.body.token} 已重复 已被禁止`, data: { isexist: "true"}})
            }else {
                // 不存在则将token写入到配置文件的tokenList数组中并返回false
                configTokenTemp.tokenList.push(reqToken);
                fs.writeFileSync(configTokenPath, JSON.stringify(configTokenTemp, null, 4));
                res.send({ code: 200, status: 'success', message: `${req.body.token} 已被允许`, data: { isexist: "false", token: CryptoJS.MD5(req.body.token).toString()}})
            }
        }
    })

    // notice 接口
    // @url: /api/overview/notice/get && /api/overview/notice/new
    // @description: 在总览面板的通知列表显示提示消息
    // @method: get
    const configONoticePath = path.join(__dirname, './config/temp/onotice.json');
    function clearTempNotice(){ // 清除临时通知
        // 检查配置文件是否存在
        if(!fs.existsSync(configONoticePath)) {
            // 配置文件不存在则创建配置文件
            fs.writeFileSync(configONoticePath, JSON.stringify({noticeList: []}, null, 4));
            // 然后重新调用clearTempNotice函数
            clearTempNotice();
        }else {
            // 配置文件存在先将配置文件的内容保存到日志文件夹中
            const logONoticePath = path.join(__dirname, './logs/onotices/');
            // 新建日志文件 命名为当前时间戳
            const NewlogONoticeName = Date.now() + '.txt';
            // 检查日志文件夹是否存在
            if(!fs.existsSync(logONoticePath)) {
                // 日志文件夹不存在则创建日志文件夹
                fs.mkdirSync(logONoticePath);
            }else {
                // 日志文件夹存在则将配置文件的内容转为txt文本并保存
                fs.writeFileSync(logONoticePath + NewlogONoticeName, JSON.stringify(JSON.parse(fs.readFileSync(configONoticePath, 'utf-8')), null, 4));
                console.log(`先前项目通知已保存为日志文件`);
                console.log(`值: ${NewlogONoticeName}`);
            }
            // 清空配置文件
            fs.writeFileSync(configONoticePath, JSON.stringify({noticeList: []}, null, 4));
        }
    }
    clearTempNotice();
    app.post('/api/overview/notice/new', (req, res) => {
        const type = req.body.type;
        const text = req.body.text;
        const subt = req.body.subt;
        const token = req.body.token;
        // 检查配置文件是否存在
        if(fs.existsSync(configONoticePath)) {
            // 配置文件存在则将数据追加到配置文件的noticeList数组中
            var configONoticeTemp = JSON.parse(fs.readFileSync(configONoticePath, 'utf-8' , (err, data) => {
                if (data) {
                    // 读取成功则将数据赋值给configONoticeTemp
                    return data;
                }
            }))
            configONoticeTemp.noticeList.push({type, text, subt, token});
            fs.writeFileSync(configONoticePath, JSON.stringify(configONoticeTemp, null, 4));
            // 返回成功信息
            res.send({ code: 200, status: 'success', message: '通知已添加', data: { type, text, subt, token}});
        }else {
            // 配置文件不存在则返回错误信息
            res.send({ code: 404, status: 'error', message: '配置文件不存在', data: { type, text, subt, token}});
        }
    })
    app.get('/api/overview/notice/get', (req, res) => {
        // 检查配置文件是否存在
        if(fs.existsSync(configONoticePath)) {
            // 配置文件存在则将读取配置文件的内容并返回
            const configONoticeTemp = JSON.parse(fs.readFileSync(configONoticePath, 'utf-8'));
            res.send({ code: 200, status: 'success', message: '通知已获取', data: configONoticeTemp.noticeList , length: configONoticeTemp.noticeList.length});
        }else {
            // 配置文件不存在则返回错误信息
            res.send({ code: 404, status: 'error', message: '配置文件不存在'});
        }
    })
