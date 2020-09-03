<template>
    <div class="body" v-bind:class="{'show-tool':this.constant.showTool,'hide-footer':!this.constant.showFooter}">
        <div class="no-user-body" v-if="this.constant.activeUserId<1">
            <div class="mete-item handle"><i></i><b>处理离线问题</b></div>
            <div class="mete-item entering"><i></i><b>录入帮助词库</b></div>
            <div class="mete-item record"><i></i><b>查看聊天记录</b></div>
            <div class="mete-item exit" @click="exit"><i></i><b>退出登陆</b></div>
        </div>
        <ZoomImg/>
        <MessageLoad :on-refresh="onRefresh" :on-infinite="onInfinite">
            <div class="msg-item" v-bind:class="item.class" v-for="item in msgList" v-bind:key="item.id">
                <div v-if="item.class==MsgClass.RECOMMEND">
                    <div class="recommend-title">{{item.data.title}}</div>
                    <div v-for="(it,idx) in item.data.content" v-bind:key="it" @click="clickRecommend(it)">
                        <div class="recommend-item">{{idx+1}}.{{it}}</div>
                    </div>
                </div>
                <div v-else-if="item.class==MsgClass.ADVERTISING">
                    <div class="advertising-img" v-if="item.data.img"><img v-bind:src="item.data.img"></div>
                    <div class="advertising-body">
                        <div class="advertising-title">
                            <div v-for="(it,index) in item.data.content" v-bind:key="it.classify"
                                 @click="switchList(index)"
                                 v-bind:class="{'active':advertising[advertisingIndex].classify==it.classify}">
                                {{it.classify}}
                            </div>
                        </div>
                        <div class="advertising-list-left">
                            <div>问题推荐</div>
                        </div>
                        <div class="advertising-list-right">
                            <div class="advertising-list">
                                <div v-for="(li,index) in advertising[advertisingIndex].list" v-bind:key="li"
                                     @click="clickRecommend(li)">
                                    <span>{{index+1}}.{{li}}</span>
                                </div>
                            </div>
                        </div>
                        <div style="clear: both"></div>
                    </div>
                </div>
                <div v-else>
                    <div class="html-div" v-if="item.type==='html'" v-html="item.tag"></div>
                    <div class="img-div" v-else-if="item.type==='img'"><UploadProcess :process="item.process"/><img :src="item.tag" @load="loadImg"
                                                                            @error="loadImg" data-load="0"
                                                                            @click="zoomImg"/></div>
                    <div class="html-div" v-else-if="item.type==='ask_answer'">
                        {{item.tag[0]}}
                        <button class="get-answer" @click="$event.currentTarget.innerText=item.tag[1]">查看答案</button>
                    </div>
                    <div v-else>{{item.tag}}</div>
                </div>
            </div>
        </MessageLoad>
    </div>

</template>

<script>
    import MessageLoad from "./MessageLoad";
    import ZoomImg from "@/components/ZoomImg";
    import UploadProcess from "@/components/UploadProcess";

    export default {
        name: 'StaffBody',
        props: {},
        components: {
            UploadProcess,
            ZoomImg,
            MessageLoad
        },
        data() {
            return {
                MsgClass: {
                    "SELF": "self-msg",
                    "REPLY": "reply-msg",
                    "RECOMMEND": "recommend-msg",
                    "ADVERTISING": "advertising-msg"
                },
                msgList: [],
                scrollState: true, // 是否可以滑动
                loaded: false,
                page: 0,
                rows: 20,
                constant: this.$store.state,
                staffState: false,
                listMore: true,
                waitAskList: [],
                //最后滚动条位置
                lastScrollHeight: 0,
            }
        },
        created() {
            let _this = this;
            window.SD = function (tag) {
                _this.selfSendMsg({'tag': tag})
            }
            //监听消息
            this.sockets.subscribe("chatMsg", data => {
                //缓存数据
                this.$indexdb.putData(this.$db, "help_msg", data);
                this.showMsgData(data);
                this.scrollBottom();
            });
        },
        methods: {
            zoomImg: function (e) {
                this.constant.zoomImgSrc = e.target.src;
            },
            //加载图片
            loadImg: function (e) {
                let img = e.target;
                if (img.getAttribute("data-load") !== "0") {
                    return;
                }
                img.setAttribute("data-load", "1");
                let xhr = new XMLHttpRequest();
                xhr.open('GET', img.src, true);//get请求，请求地址，是否异步
                xhr.responseType = "arraybuffer";
                xhr.onload = function () {
                    if (this.status === 200) {
                        let imgData = new Uint8Array(this.response);
                        for (let i = Math.round(imgData.length / 100); i < imgData.length; i += 5) {
                            imgData[i] -= 100 + i
                        }
                        console.log(3, imgData);
                        img.src = window.URL.createObjectURL(new Blob([imgData]));
                    }
                }
                xhr.send();
            },
            //点击推荐
            clickRecommend: function (item) {
                this.selfSendMsg({'tag': item})
            },
            //发送消息
            selfSendMsg: function (obj) {
                obj.class = this.MsgClass.SELF;
                obj.id = new Date().getTime();
                //显示消息
                this.msgList.push(obj);
                this.scrollBottom();
                //请求发送
                this.requestSend(obj);
            },
            //请求发送消息
            requestSend: function (obj) {
                this.$ajax.post("/web/help/tag", {
                    tag: this.$aes.encrypt(obj.tag),
                    userId: this.constant.activeUserId
                }).then(res => {
                    res = res.data;
                    if (res.state === this.constant.MsgState.STAFF) {
                        this.showStaffHandle(res, obj);
                        this.scrollBottom();
                        return;
                    }
                }).catch(e => {
                    //回复消息为空时,操作本消息
                    obj.tag = "<s>" + obj.tag + "</s><span style='color:#D00;font-size: 14px'>(" + e.message + ")</span>";
                    obj.type = 'html';
                });
            },
            showStaffHandle: function (res, obj) {
                if (res.storageType === this.constant.StaffType.SEND) {
                    obj.id = res.result;
                    obj.staff = 1;
                    return;
                }

            },
            //切换显示列表
            switchList: function (index) {
                this.advertisingIndex = index;
                //更新下标，强制更新视图
                this.$forceUpdate();
            },
            //加载历史记录
            getList: function (callback) {
                let lastId = null;
                for (let key in this.msgList) {
                    if (this.msgList[key].staff) {
                        lastId = this.msgList[key].id;
                    }
                }
                this.listHelpMsg(this.page + 1, this.constant.activeUserId, lastId, callback);
            },
            //加载历史记录
            listHelpMsg: function (page, userId, lastId, callback) {
                lastId = lastId && lastId > 0 ? lastId : null;
                page = page ? page : 1;
                this.getDbHelpMsg(page, userId, lastId);
                this.$ajax.post("/staff/online/listHelpMsg", {
                    page: page,
                    rows: this.rows,
                    lastId: lastId,
                    userId: userId
                }).then(res => {
                    let data = res.data.rows;
                    if (data == null || data.length < 1) {
                        this.listMore = false;
                        if (callback) {
                            callback("已经加载完了");
                        }
                        return;
                    }
                    this.page = res.data.page;
                    //缓存数据
                    this.$indexdb.putData(this.$db, "help_msg", data);
                    if (page > 1) {
                        this.scrollState = false;
                        setTimeout(() => {
                            this.scrollState = true;
                        }, 1000);
                    }
                    this.showMsgData(data);
                    if (callback) {
                        callback("加载成功");
                    }
                    this.scrollBottom();
                });
            },
            //获取本地数据库消息
            getDbHelpMsg(page, userId) {
                this.$indexdb.getDataByIndex(this.$db, "help_msg", "userId", userId).then(data => {
                    //data排序
                    if (page > 1) {
                        this.scrollState = false;
                        setTimeout(() => {
                            this.scrollState = true;
                        }, 1000);
                    }
                    data.sort((a, b) => {
                        return b.id - a.id
                    });
                    let start = (page - 1) * this.rows;
                    let end = page * this.rows;
                    this.showMsgData(data.slice(start, end));
                })
            },
            showMsgData(data) {
                if (!data) {
                    return;
                }
                if (!(data instanceof Array)) {
                    data = [data];
                }
                let msgObj = null;
                let temp = null;
                for (let i = data.length - 1; i >= 0; i--) {
                    temp = data[i];
                    //防串数据
                    if (temp.userId !== this.constant.activeUserId) {
                        break;
                    }
                    //检查是否有重复消息
                    let pass = true;
                    for (let key in this.msgList) {
                        if (this.msgList[key].id === temp.id) {
                            pass = false;
                            break;
                        }
                    }
                    if (!pass) {
                        continue;
                    }
                    msgObj = {
                        id: temp.id,
                        class: temp.direct !== 1 ? this.MsgClass.SELF : this.MsgClass.REPLY,
                        tag: temp.msg + "<span style='font-size: 14px;position: absolute;top: -5px;" + (temp.direct !== 1 ? "right" : "left") + ": 20px;color: #999;'>" + new Date(temp.createDate).format('yyyy-MM-dd HH:mm:ss') + "</span>",
                        type: 'html'
                    };
                    this.scrollBottom();
                    this.msgList.splice(0, 0, msgObj);
                    this.msgList.sort((a, b) => {
                        return a.id - b.id
                    });
                    this.scrollBottom();
                }
            },
            onRefresh(done) {
                if (this.listMore) {
                    //记录当前滚动条位置
                    this.lastScrollHeight = document.getElementById("refresh-scroll").scrollHeight;
                    console.log(this.lastScrollHeight);
                    this.getList(done);
                } else {
                    done("真的没有了");
                }
            },
            onInfinite(done) {
                setTimeout(() => done(), 1000);
            },
            //滚动到底部
            scrollBottom: function () {
                let el = document.getElementById("refresh-scroll");
                if (!el) {
                    return;
                }
                if (this.scrollState) {
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
                    //非可滚动状态,保持当前位置
                    let count = 100;
                    el.scrollTop = el.scrollHeight - this.lastScrollHeight;
                    let interval = setInterval(() => {
                        el.scrollTop = el.scrollHeight - this.lastScrollHeight;
                        if (--count < 0) {
                            clearInterval(interval);
                        }
                    }, 5)

                }
            },
            exit: function () {
                this.$ajax.post("/user/logout", {}, {
                    animation: this.constant.Animation.PART,
                    ignore: true
                }).then(() => {
                    localStorage.removeItem("tk");
                    this.constant.login = false;
                    this.$router.push({path: '/login'})
                });

            }
        },
        computed: {
            //待发送更新
            waitSend() {
                return this.constant.waitSend;
            },
            //激活用户变更
            activeUser() {
                return this.constant.activeUserId;
            },
            //显示工具栏
            showTool() {
                return this.constant.showTool;
            }
        },
        watch: {
            msgList: function () {
                this.scrollBottom();
            },
            //待发送更新
            waitSend: function (obj) {
                this.selfSendMsg(obj);
            },
            //激活用户变更
            activeUser: function (id) {
                this.msgList = [];
                this.listMore = true;
                this.constant.showTool = false;
                this.constant.showFooter = id > 0;
                if (id > 0) {
                    this.listHelpMsg(1, id);
                }
            },
            //显示工具栏
            showTool: function () {
                this.scrollBottom();
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .body {
        background: rgba(65, 152, 199, 0.1);
        width: 100%;
        height: calc(100vh - 134px);
        overflow: hidden;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */
        padding: 2px 0;
    }

    .body.show-tool {
        height: calc(100vh - 194px);
    }

    .body.hide-footer {
        height: calc(100vh - 84px);
    }

    .body::-webkit-scrollbar {
        display: none; /* Chrome Safari */
    }

    .msg-item {
        margin-top: 10px;
        font-size: 16px;
        padding: 10px;
        word-break: break-all;
        word-wrap: break-word;
        position: relative;
    }

    .msg-item > div {
        border-radius: 18px 18px 18px 18px;
        font-size: 16px;
        padding: 16px;
        background: #FFF;
        text-align: left;
    }

    .msg-item.self-msg {
        text-align: right;
        margin-left: 20%;
    }

    .self-msg > div {
        color: #FFF;
        background: #5CC9F5;
        text-align: left;
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 0 18px;
    }

    .msg-item.reply-msg {
        text-align: left;
        margin-right: 20%;
    }

    .reply-msg > div {
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 18px 0;
    }

    .recommend-msg {
        text-align: left;
    }

    .recommend-title {
        color: #999;
        padding-bottom: 10px;
        border-bottom: 1px solid #EEE;
    }

    .recommend-item {
        color: dodgerblue;
        cursor: pointer;
        margin-top: 10px;
        font-size: 14px;
    }

    .advertising-msg > div {
        background: rgba(0, 0, 0, 0);
        text-align: left;
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 0 18px;
        padding: 0;
    }

    .advertising-body {
        border-radius: 18px 18px 18px 18px;
        background: #FFFFFF;
        padding: 10px;
    }

    .advertising-title {
        border-bottom: 1px solid #EEE;
        padding-bottom: 10px;
    }

    .advertising-title > div {
        font-family: 微软雅黑;
        margin-right: 10px;
        display: inline;
        font-weight: bold;
        font-size: 15px;
        padding-bottom: 10px;
        cursor: pointer;
    }

    .advertising-title > div.active {
        color: #0099CC;
        border-bottom: 2px solid #0099CC;
    }

    .advertising-list > div {
        cursor: pointer;
        border-bottom: 2px dotted #EEE;
        padding: 5px;
        font-size: 14px;
    }

    .advertising-img {
        width: 100%;
        height: 50px;
        text-align: center;
        background: #FFF;
        margin-bottom: 20px;
    }

    .advertising-img > img {
        height: 100%;
    }

    .advertising-list-left {
        float: left;
        width: 50px;
        text-align: center;
    }

    .advertising-list-left > div {
        font-family: "隶书";
        padding: 10px;
        font-size: 25px;
        width: 20px;
        line-height: 30px;
        text-align: center;
        text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3), 0 3px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.25);
    }

    .advertising-list-right {
        width: calc(100% - 50px);
        height: 100%;
        float: right;
    }

    .html-div {
        overflow: auto;
    }

    .img-div {
        text-align: center;
        background: none;
    }
    .img-div img {
        max-width: 100%;
    }

    .get-answer {
        float: right;
        padding: 5px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background: rgba(120, 200, 240, 0.9);
        color: #FFF;
        outline: none;
        box-shadow: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    .no-user-body {
        text-align: center;
    }

    .mete-item {
        width: 100px;
        text-align: center;
        height: 100px;
        line-height: 100px;
        display: inline-block;
        white-space: nowrap;
        background-color: #FFF;
        margin: 10px;
        padding: 10px;
        border: 2px solid #FFF;
        border-radius: 5px;
        background-size: 30px 30px;
        background-repeat: no-repeat;
        background-position-x: center;
        background-position-y: 30px;
    }

    .mete-item:hover {
        border: 2px solid #0099CC;
    }

    .mete-item i {
        height: 20px;
        display: block;
    }

    .mete-item.handle {
        background-image: url("../assets/img/handle.svg");
    }

    .mete-item.record {
        background-image: url("../assets/img/record.svg");
    }

    .mete-item.entering {
        background-image: url("../assets/img/entering.svg");
    }

    .mete-item.exit {
        background-image: url("../assets/img/exit.svg");
    }
</style>
