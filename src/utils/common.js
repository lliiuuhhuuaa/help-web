import CryptoJS from 'crypto-js/crypto-js'

let k = CryptoJS.enc.Utf8.parse("$this's_aes_key$");
let install = function (Vue) {
        /***
         * aes
         * @type {{encrypt: (function(*=): string), decrypt: (function(*=): string)}}
         */
        Vue.prototype.$aes = {
            /**
             * aes加密
             * @param word
             * @returns {string}
             */
            encrypt: function (text) {
                let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), k, {
                    iv: k,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                return "$" + CryptoJS.enc.Base64.stringify(encrypted.ciphertext) + "$";
            },
            /***
             * aes解密
             * @param word
             * @returns {string}
             */
            decrypt: function (text) {
                if (text.startsWith("$") && text.endsWith("$")) {
                    text = text.substr(1, text.length - 2);
                }
                let base64 = CryptoJS.enc.Base64.parse(text);
                let src = CryptoJS.enc.Base64.stringify(base64);
                let decrypt = CryptoJS.AES.decrypt(src, k, {
                    iv: k,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                return CryptoJS.enc.Utf8.stringify(decrypt).toString();
            }
        };
        //系统配置
        Vue.prototype.$config = {
            //获取系统配置
            get: function (key) {
                return localStorage.getItem("SystemConfig." + key);
            },
            //保存系统配置
            set: function (k, v) {
                localStorage.setItem("SystemConfig." + k, v);
            }
        };
        //显示操作全局方法
        Vue.prototype.$show = {
            /**
             * 内容滚动
             * @param _this
             * @param forceScroll  如果当前为锁定状态，是否强制滚动
             */
            scrollBottom: function (_this,forceScroll) {
                let el = document.getElementById("refresh-scroll");
                if (!el) {
                    return;
                }
                if (!_this.$store.state.showScrollBottom) {
                    //可滚动
                    el.scrollTop = el.scrollHeight;
                    let count = 5;
                    let interval = setInterval(() => {
                        el.scrollTop = el.scrollHeight;
                        if (--count < 0) {
                            clearInterval(interval);
                        }
                    }, 10)
                } else {
                    if(!forceScroll){
                        return;
                    }
                    //非可滚动状态,保持当前位置
                    let count = 2;
                    let interval = setInterval(() => {
                        //+1微调
                        el.scrollTop = el.scrollHeight - _this.$store.state.lastScrollHeight-8;
                        if (--count < 0) {
                            clearInterval(interval);
                        }
                    }, 10)

                }
            },
            //滚动到底部
            scrollToBottom: function (_this) {
                let el = document.getElementById("refresh-scroll");
                if (!el) {
                    return;
                }
                if (!_this.$store.state.showScrollBottom) {
                    //可滚动
                    el.scrollTop = el.scrollHeight;
                    let count = 5;
                    let interval = setInterval(() => {
                        el.scrollTop = el.scrollHeight;
                        if (--count < 0) {
                            clearInterval(interval);
                        }
                    }, 10)
                }
            },
            //输入状态同步显示处理
            handleInputIng: function (_this,data,result) {
                let temp = null;
                if(result){
                    if(typeof(data.msg)=='string') {
                        if (data.msg.match(/\[:([0-9]{1,2}):\]/)) {
                            return false;
                        }
                    }
                    for (let i = _this.msgList.length - 1; i >= _this.msgList.length - 10 && i >= 0; i--) {
                        temp = _this.msgList[i];
                        if (temp.id === 9999999999998) {
                            temp.id = data.id;
                            temp.tag = data.msg;
                            temp.createDate = data.createDate;
                            _this.$show.scrollBottom(_this);
                            return true;
                        }
                    }
                    return false;
                }
                let id = 9999999999999;
                if (data.state) {
                    for (let i = _this.msgList.length - 1; i >= _this.msgList.length - 10 && i >= 0; i--) {
                        temp = _this.msgList[i];
                        if (temp.id === id) {
                            if (data.text) {
                                temp.tag = data.text;
                                temp.id--;
                            }
                            return;
                        }
                    }
                    let reply = {
                        id: id,
                        class: _this.MsgClass.REPLY,
                        tag: '对方正在输入...',
                        createDate:+new Date(),
                    };
                    _this.msgList.push(reply);
                } else {
                    for (let i = _this.msgList.length - 1; i >= _this.msgList.length - 10 && i >= 0; i--) {
                        if (_this.msgList[i].id === id) {
                            _this.msgList.splice(i, 1);
                            break;
                        }
                    }
                }
            },
            horizontalScrolling:function (e) {
                let _this = null;
                for(let i=0;i<e.path.length;i++){
                    //查找父级
                    if(e.path[i].className){
                        if(e.path[i].className.indexOf("horizontal-scrolling")>-1){
                            _this = e.path[i];
                        }
                    }
                }
                if(_this==null){
                    return true;
                }
                let startX = _this.scrollLeft+e.layerX;
                document.onmousemove = mouseMove;
                document.onmouseleave = mouseUp;
                document.onmouseup = mouseUp;
                // 鼠标按下
                function mouseMove(e){
                    _this.scrollLeft =startX-e.layerX;

                }
                //鼠标弹起
                function mouseUp(){
                    document.onmousemove = null;
                }
            }
        }
    }
/***
 * 时间格式化
 * @param fmt
 * @returns {*}
 */
Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
export default {
    install
}