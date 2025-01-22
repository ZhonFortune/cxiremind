// @name: pageNotice.js
// @description: 页面提示
// @todo: function

// 主函数
// @function: pagenotice
// @description: 在总览面板的通知列表显示提示消息
async function pagenotice(type, text, subt) {
    // 定义类型
    const typeList = {
        "normal": {
            "text": "操作信息",
            "color": "#14DD05"
        },
        "warn": {
            "text": "警告信息",
            "color": "#FF2323"
        }
    };
    // 根据类型获取类型信息
    const isText = text;
    const isSubt = subt;
    let isType, isColor, isTypeText;
    // 判断类型是否存在
    if (typeList[type]) {
        // 存在则赋值
        isType = typeList[type];
    } else {
        // 不存在则赋值默认
        isType = typeList["normal"];
    }
    try {
        // 获取唯一的token
        const tokenFinal = await getUniqueToken();

        // 创建消息函数
        // @description: 创建消息
        function createNotice() {
            // 发送ajax请求存入临时消息
            $.ajax({
                url: "/api/overview/notice/new",
                type: "POST",
                contentType: 'application/json',
                dataType: 'json',
                // 请求参数为: {type, text, subt, token}
                data: JSON.stringify({
                    type: isType,
                    text: isText,
                    subt: isSubt,
                    token: tokenFinal
                }),
                success: function (res) {
                    // 插入点的DOM
                    if (res.code === 200) {
                        // 成功则插入消息
                        insertNotice(isType, isText, isSubt, tokenFinal);
                    } else {
                        console.log(res);
                        console.log('后端返回的数据格式不符合预期,请检查接口返回值.');
                    }
                }
            })
        }

        createNotice();

    } catch (error) {
        console.log('在页面提示消息流程中出现错误:', error);
    }
}

// 插入消息函数
// @function: insertNotice
// @description: 在总览面板的通知列表插入消息
function insertNotice(type, text, subt, token) {
    const overviewNoticeDom = document.querySelector(".panel-operation .overview .overview-notice .overview-notice-list");
    if (!overviewNoticeDom) {
        console.log("无法找到插入消息的DOM节点，请检查选择器是否正确。");
        return;
    }
    // 创建消息DOM
    const noticeDom = `
        <div class="overview-notice-list-item flex-column" id="${token}">
            <div class="ov-type flex-row">
                <div class="ov-type-icon flex-row">
                    <div style="background-color: ${type.color}"></div>
                </div>
                <span style="color: ${type.color}">${type.text}</span>
            </div>
            <div class="ov-line"></div>
            <div class="ov-content flex-row">
                <div class="ov-content-line" style="background-color: ${type.color}"></div>
                <div class="ov-content-body flex-column">
                    <span>${text}</span>
                    <span>${subt}</span>
                </div>
            </div>
        </div>
    `;
    // 插入到最前面
    overviewNoticeDom.insertAdjacentHTML("afterbegin", noticeDom);
}

// 获取唯一token的异步函数
async function getUniqueToken() {
    let attempts = 0;
    const maxAttempts = 2; // 设置最大尝试次数，避免无限循环
    while (attempts < maxAttempts) {
        // 先生成一个36位的随机数 再生成一个时间戳 拼接
        const randomStr = Math.random().toString(36).substring(2, 9);
        const timestamp = Date.now();
        const tokenTemp = randomStr + timestamp;
        // console.log(`随机数: ${randomStr}, 时间戳: ${timestamp}, token: ${tokenTemp}`)
        // 检查token是否已存在
        const isExist = await checkTokenExists(tokenTemp);
        if (isExist) {
            // console.log(isExist);
            return isExist.token;
        }
    }
    console.log('超过最大尝试次数，仍未获取到可用的token，请检查网络或后端服务。');
    throw new Error('Failed to get a unique token');
}

// 检查token是否已存在的异步函数
async function checkTokenExists(tokenTemp) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/checktokenisexist",
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify({ 'token': tokenTemp }),
            dataType: "json",
            success: (res) => {
                if (res) {
                    resolve(res.data);
                } else {
                    console.log('后端返回的数据格式不符合预期，请检查接口返回值。');
                    reject(new Error('Invalid response format'));
                }
            },
            error: (xhr, status, error) => {
                console.log("检查token是否存在的请求出错:", error);
                reject(error);
            }
        });
    });
}

// 导出模块
export { pagenotice , insertNotice };
