// @name: menuChange.js
// @description: 菜单切换
// code >>

import { insertNotice  } from "../public/pagenotice.js";

// 规定菜单项数组
// @param {Array} menuList => id
// @description: 菜单项数组 变量名为 ID值
const menuList = ['overview', 'notice' , 'calendar', 'database', 'api', 'account' , 'about'];

// 获取菜单项盒子
// @description: 菜单项盒子,仅在该范围内点击有效
const menu = document.querySelector('.menu.flex-column .menu-list.flex-column');

// 菜单项切换函数
// @function menuChange(id) 
// @description: 用于切换菜单项

function menuChange(id) {
    // 将传入值转换为 DOM 选择器
    const dom = document.querySelector(`.menu-item#${id}`);
    // 改变对应ID的样式
    dom.classList.add('isActive');
    dom.classList.remove('isStandBy');
    // 移除其他菜单项的样式
    menuList.forEach((item) => {
        if (item !== id) {
            document.querySelector(`.menu-item#${item}`).classList.add('isStandBy');
            document.querySelector(`.menu-item#${item}`).classList.remove('isActive');
        }
    })
    // 执行菜单项函数
    menuChangeFunc(id);
    menuObjectFunc(id);
}

// 执行菜单对象设定的点击事件
// @function: menuObjectFunc()

const menuObject = {
    'overview': () => {
        // console.log('overview 已点击');
        // console.log("载体数据: ")
        // 发送ajax请求拿到缓存的数据
        $.ajax({
            url: '/api/overview/notice/get',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: (res) => {
                // console.log(res);
                const length = res.length;
                // 临时存储返回的数据
                const temp = res.data;
                // console.log(temp);
                // // 循环遍历
                for (let i = 0; i < length; i++) {
                    insertNotice(temp[i].type, temp[i].text, temp[i].subt, temp[i].token);
                }
            },
            error: (err) => {
                console.log(err);
            }
        })
    }
}

function menuObjectFunc(id) {
    // 先检查对象中是否存在该函数
    if (menuObject[id]) {
        // 如果存在则执行
        menuObject[id]();
    }
}

// 页面更新
// @function: pageUpdate(id,res)
// @description: 更新操作页面和标题
function pageUpdate(id,res) {
    const titledom = document.querySelector('.panel-header .panel-title span');
    const contentdom = document.querySelector('.panel-operation');
    const labeldom = document.querySelector('.panel-tag .tag-list .tag-item#nowPage span');
    const title = {
        'overview': '总览',
        'notice': '通知',
        'calendar': '日历',
        'database': '数据库',
        'api': 'API',
        'account': '账户',
        'about': '关于'
    }
    titledom.innerHTML = title[id];
    contentdom.innerHTML = res;
    labeldom.innerHTML = 'Page/' + title[id];
}

// 菜单项执行函数
// @description: 菜单项点击事件
// @function menuChangeFunc(id)

function menuChangeFunc(id) {
    // 获取对应ID的菜单项
    const dom = document.querySelector(`.menu-item#${id}`);
    // 判断菜单项是否处于激活状态
    if (dom.classList.contains('isActive')) {
        // 如果为激活则发送请求 拿到对应的操作面板HTML页面
        try {
            // 发送请求
            $.ajax({
                url: `/api/loadpage`,
                type: 'POST',
                dataType: 'html',
                contentType: 'application/json',
                data: JSON.stringify({'id': id}),
                success: (res) => {
                    // 更新标题
                    // console.log(res);
                    pageUpdate(id,res);
                },
                error: (err) => {
                    console.log(res.message);
                }
            })
        } catch (err) {
            console.log(err);
        }
    }else {
        // 如果为非激活状态则不执行任何操作
    }
}

// 菜单项点击事件
menu.addEventListener('click', (e) => {
    // 如果点击 menu-item 内的元素依然读取 menu-item 的 id
    if (e.target.parentNode.classList.contains('menu-item')) {
        const id = e.target.parentNode.id;
        // 判断点击的ID是否在菜单项数组中
        if (menuList.includes(id)) {
            // 切换菜单项
            menuChange(id);            
        }else {
            console.log(`该项存在菜单中 其为标准的菜单项 但不存在菜单数组中`);
            console.log(e.target);
        }
    } else {
        console.log(`该项存在菜单中 但其不为标准的菜单项`);
        console.log(e.target);
    }
})

// 默认菜单项
menuChange('overview');