let alertContent = "<input type=\"checkbox\" style=\"display: none\" class=\"modal-controller\"><label class=\"overlay\"></label><div class=\"alert-body\"><div class=\"title-body\"><span class=\"title\"></span><span class=\"close\">✕</span></div><div class=\"content\"></div><div class=\"btn-group\"></div></div>";
let dialog = {
        /**
         * 错误弹框
         * @param text
         */
        error: function (text, param) {
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
                text = param;
            }
            //标题
            param.title = param.title || "错误提示";
            //取消按钮文字
            param.cancelBtnText = param.cancelBtnText || "我知道了";
            //是否只可以开一个,默认true
            if(param.single === undefined){
                param.single = true;
            }
            //当single为true时与update为true时，将更新原有对象
            if(param.update === undefined){
                param.update = true;
            }
            //显示图标,默认error
            param.icon = 'error';
            this.alert(text, param);
        },
        /**
         * 警告弹框
         * @param text
         */
        warn: function (text, param) {
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
                text = param;
            }
            //标题
            param.title = param.title || "警告提示";
            //取消按钮文字
            param.cancelBtnText = param.cancelBtnText || "我知道了";
            //是否只可以开一个,默认true
            if(param.single === undefined){
                param.single = true;
            }
            //当single为true时与update为true时，将更新原有对象
            if(param.update === undefined){
                param.update = true;
            }
            //显示图标,默认warn
            param.icon = 'warn';
            this.alert(text, param);
        },
        /**
         * 普通消息弹框
         * @param text
         */
        info: function (text, param) {
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
                text = param;
            }
            //标题
            param.title = param.title || "提示";
            //取消按钮文字
            param.cancelBtnText = param.cancelBtnText || "我知道了";
            //是否只可以开一个,默认true
            if(param.single === undefined){
                param.single = true;
            }
            //当single为true时与update为true时，将更新原有对象
            if(param.update === undefined){
                param.update = true;
            }
            //显示图标,默认info
            param.icon = 'info';
            this.alert(text, param);
        },
        /**
         * msg弹框
         * @param text
         */
        msg: function (text, param) {
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
                text = param;
            }
            param.icon = null;
            //是否可以点击背景关闭,默认false
            param.bgClose = false;
            //背景隐藏
            param.bgHide = true;
            //延迟关闭
            param.time = param.time || 5000;
            //类型为msg，只显示内容，其它都没有
            param.type='msg';
            this.alert(text, param);
        },
        /**
         * 弹框
         * @param text
         */
        confirm: function (text, param, confirmCallback,cancelCallback) {
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
                text = param;
            }

            //标题
            param.title = param.title || "确认框";
            //取消按钮文字
            param.cancelBtnText = param.cancelBtnText || "取消";
            let btn = {};
            btn[param.confirmText?param.confirmText:"确定"] = confirmCallback;
            param.btns = [btn];
            //取消回调
            param.cancelCallback = cancelCallback||null;
            this.alert(text, param);
        },
        /**
         * 弹框
         * @param text
         */
        alert: function (text, param) {
            console.log(text, param)
            if (!text && !param) {
                console.error("缺少弹窗内容(1)");
                return;
            }
            if (typeof (text) === 'string') {
                param = param || {};
                param.content = text;
            }
            if (!("content" in param)) {
                console.error("缺少弹窗内容(2)");
                return;
            }
            //标题
            param.title = param.title || "提示";
            //取消按钮文字
            param.cancelBtnText = param.cancelBtnText || "我知道了";
            //是否可以点击背景关闭,默认false
            param.bgClose = param.bgClose || false;
            //背景隐藏
            param.bgHide = param.bgHide || false;
            //是否只可以开一个,默认false
            param.single = param.single || false;
            //当single为true时与update为true时，将更新原有对象
            param.update = param.update || false;
            //增加按钮
            param.btns = param.btns || null;
            //显示图标,默认error
            param.icon = param.icon || null;
            let node = null;
            if (param.single) {
                node = document.getElementById("alert-modal-single");
                if (node && !param.update) {
                    //开启单例并已存在弹窗,中止操作
                    return;
                }
            }
            if (!node) {
                //不存在弹窗,创建新弹窗
                node = document.createElement("div");
                node.classList.add("alert-modal");
                if (param.single) {
                    //开启单例
                    node.id = "alert-modal-single";
                }
            }
            //修改内容
            node.innerHTML = alertContent;
            if(param.type==='msg'){
                node.getElementsByClassName("title-body")[0].remove();
                node.getElementsByClassName("btn-group")[0].remove();
            }
            //修改标题
            let title = node.getElementsByClassName("title")[0];
            if(title){
                title.innerHTML = param.title;
            }
            let content = node.getElementsByClassName("content")[0];
            content.innerHTML = param.content;
            if (param.icon) {
                //修改图标
                content.classList.add(param.icon);
            }
            //背景隐藏
            if (param.bgHide) {
                node.getElementsByClassName("overlay")[0].classList.add("trans");
            }
            if(!param.btns){
                param.btns = [];
            }
            param.cancelCallback = param.cancelCallback||this.close;
            let cancelBtn = {};
            param.btns.push(cancelBtn);
            cancelBtn[param.cancelBtnText] = param.cancelCallback;
            //追加元素
            document.getElementsByTagName("body")[0].append(node);
            //绑定事件
            this.bindEvent(node, param);
            setTimeout(() => {
                //显示弹窗
                node.getElementsByClassName("modal-controller")[0].setAttribute('checked', 'checked');
            }, 100);
            if (param.time && param.time>100) {
                if(node.closeTimer){
                    //清除原定时
                    clearTimeout(node.closeTimer)
                }
                let closeTimer = setTimeout(() => {
                    this.close(node);
                }, param.time);
                node.closeTimer = closeTimer;
            }
        },
        //绑定事件
        bindEvent: function (node, param) {
            //右上角绑定关闭
            let closeBtn = node.getElementsByClassName("close")[0];
            if(closeBtn){
                closeBtn.onclick = () => param.cancelCallback(node);
            }
            if (param.bgClose) {
                //点击背景关闭
                node.getElementsByClassName("overlay")[0].onclick = () => param.cancelCallback(node);
            }
            //绑定按钮
            if (param.btns) {
                let btnGroup = document.getElementsByClassName("btn-group")[0];
                if(btnGroup){
                    param.btns.forEach((item) => {
                        let btn = document.createElement("button");
                        btn.classList.add("btn-item");
                        for (let key in item) {
                            btn.innerText = key;
                            btn.onclick = () => item[key](node);
                            break;
                        }
                        btnGroup.appendChild(btn);
                    })
                }
            }

        },
        //关闭事件
        close: function (node) {
            let controller = node.getElementsByClassName("modal-controller")[0];
            controller.removeAttribute("checked");
            setTimeout(() => {
                node.remove();
            }, 500)
        }
}
dialog.install = function (Vue) {
    if (!document.getElementById("alert-style")) {
        let styleContent = ".alert-modal>input~*{overflow:hidden;max-height:0;opacity:0}.alert-modal .overlay{top:0;left:0;bottom:0;right:0;position:fixed;margin:0;border-radius:0;background:rgba(17,17,17,0.6);transition:all .3s;z-index:100000}.alert-modal .overlay.trans{opacity:0}.alert-modal .overlay~*{border:0;position:fixed;top:50%;left:50%;transform:translateX(-50%) translateY(-50%) scale(0.2,0.2);z-index:1000000;transition:all .3s ease}.alert-modal>input:checked~*{display:block;opacity:1;max-height:10000px}.alert-modal>input:checked~.overlay~*{max-height:90%;overflow:auto;-webkit-transform:translateX(-50%) translateY(-50%) scale(1,1);transform:translateX(-50%) translateY(-50%) scale(1,1)}.alert-body{background:#FFF;border-radius:10px;width:300px;box-shadow:0px 0px 5px 0px #555;}.alert-body .title-body{padding:10px;text-align:center;border-bottom:1px solid #DDD;height:30px;line-height:30px}.alert-body .title-body .close{float:right;font-weight:bold;font-size:20px;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-o-user-select:none;user-select:none}.alert-body .title .close:hover{color:#D00}.alert-body .content{margin:10px;padding:20px;position:relative;text-align:center;background-size:45px 45px;background-repeat:no-repeat;background-position-x:30px;background-position-y:center}.alert-body .content.error{text-align:left;padding-left:90px;background-images:url(\"data:images/svg+xml;charset=utf-8,%3Csvg t='1600608976104' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3538' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16'%3E%3Cdefs%3E%3Cstyle type='text/css'%3E%40font-face %7B font-family: element-icons%3B src: url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.woff') format('woff')%2C url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.ttf ') format('truetype')%3B %7D %3C/style%3E%3C/defs%3E%3Cpath d='M512 0a512 512 0 0 0-512 512 512 512 0 0 0 512 512 512 512 0 0 0 512-512 512 512 0 0 0-512-512z' fill='%23FD6B6D' p-id='3539' data-spm-anchor-id='a313x.7781069.0.i0' class=''%3E%3C/path%3E%3Cpath d='M513.755429 565.540571L359.277714 720.018286a39.058286 39.058286 0 0 1-55.296-0.073143 39.277714 39.277714 0 0 1 0.073143-55.442286l154.331429-154.331428-155.062857-155.136a36.571429 36.571429 0 0 1 51.712-51.785143l365.714285 365.714285a36.571429 36.571429 0 1 1-51.785143 51.785143L513.755429 565.540571z m157.549714-262.582857a35.254857 35.254857 0 1 1 49.737143 49.737143l-106.057143 108.982857a35.254857 35.254857 0 1 1-49.883429-49.810285l106.203429-108.982858z' fill='%23FFFFFF' p-id='3540'%3E%3C/path%3E%3C/svg%3E\")}.alert-body .content.warn{text-align:left;padding-left:90px;background-images: url(\"data:images/svg+xml;charset=utf-8,%3Csvg t='1600691073270' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='6206' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16'%3E%3Cdefs%3E%3Cstyle type='text/css'%3E%40font-face %7B font-family: element-icons%3B src: url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.woff') format('woff')%2C url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.ttf ') format('truetype')%3B %7D %3C/style%3E%3C/defs%3E%3Cpath d='M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zM512 877.714286c-40.228571 0-73.142857-32.914286-73.142857-73.142857s32.914286-73.142857 73.142857-73.142857 73.142857 32.914286 73.142857 73.142857S552.228571 877.714286 512 877.714286zM585.142857 512c0 40.228571-32.914286 73.142857-73.142857 73.142857s-73.142857-32.914286-73.142857-73.142857L438.857143 219.428571c0-40.228571 32.914286-73.142857 73.142857-73.142857s73.142857 32.914286 73.142857 73.142857L585.142857 512z' p-id='6207' fill='%23F4D671'%3E%3C/path%3E%3C/svg%3E\")}.alert-body .content.info{text-align:left;padding-left:90px;background-images: url(\"data:images/svg+xml;charset=utf-8,%3Csvg t='1600691617737' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='7970' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16'%3E%3Cdefs%3E%3Cstyle type='text/css'%3E%40font-face %7B font-family: element-icons%3B src: url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.woff') format('woff')%2C url('chrome-extension://moombeodfomdpjnpocobemoiaemednkg/fonts/element-icons.ttf ') format('truetype')%3B %7D %3C/style%3E%3C/defs%3E%3Cpath d='M512 64.7C264.9 64.7 64.7 264.9 64.7 512S264.9 959.3 512 959.3c247.1 0 447.3-200.3 447.3-447.3S759.1 64.7 512 64.7z m64 699.6c0 35.1-28.8 63.9-63.9 63.9s-63.9-28.8-63.9-63.9V508.7c0-35.1 28.8-63.9 63.9-63.9s63.9 28.8 63.9 63.9v255.6z m-63.9-440.8c-35.3 0-63.9-28.6-63.9-63.9s28.6-63.9 63.9-63.9 63.9 28.6 63.9 63.9-28.6 63.9-63.9 63.9z' p-id='7971' fill='%238a8a8a'%3E%3C/path%3E%3C/svg%3E\")}.alert-body .btn-group{text-align:center;margin-bottom:20px}.alert-body .btn-group .btn-item{padding:10px;width:100px;height:40px;outline:0;cursor:pointer;background:#09c;color:#FFF;border:2px solid #FFF;border-radius:5px;-webkit-user-select:none;-moz-user-select:none;-o-user-select:none;user-select:none}";
        let style = document.createElement("style");
        style.id = "alert-style";
        try {
            style.appendChild(document.createTextNode(styleContent));
        } catch (ex) {
            style.styleSheet.cssText = styleContent;//针对IE
        }
        document.getElementsByTagName("head")[0].appendChild(style);
    }
    Vue.prototype.$dialog = dialog;
}

export default dialog;