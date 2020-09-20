<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="no-user-body" v-if="constant.activeUserId<1">
            <router-link to="offline"><div class="mete-item handle"><i></i><b>处理离线问题</b></div></router-link>
            <router-link to="enter_dict"><div class="mete-item entering"><i></i><b>录入帮助词库</b></div></router-link>
            <router-link to="records"><div class="mete-item record"><i></i><b>查看聊天记录</b></div></router-link>
            <div class="mete-item exit" @click="exit"><i></i><b>退出登陆</b></div>
        </div>
        <div class="msg-item-body-shelter" v-if="showShelterList.length>0">
            <div class="msg-item" v-bind:class="item.class" v-for="item in showShelterList" v-bind:key="item.id">
                <ChatMsg :item="item"/>
            </div>
        </div>
        <MessageLoad :on-refresh="onRefresh">
            <div class="msg-item" v-bind:class="item.class" v-for="item in msgList" v-bind:key="item.id">
                <ChatMsg :item="item"/>
            </div>
        </MessageLoad>
        <div class="to-bottom point" v-if="constant.showScrollBottom" @click="scrollToBottom"><span v-if="constant.activeMsgUnRead">{{constant.activeMsgUnRead}}条新消息</span>回到底部</div>
    </div>

</template>

<script>
    import ChatMsg from "./ChatMsg";
    import MessageLoad from "./MessageLoad";

    export default {
        name: 'StaffBody',
        props: {},
        components: {
            MessageLoad,
            ChatMsg,
        },
        data() {
            return {
                MsgClass: {
                    "SELF": "self-msg",
                    "SYSTEM": "system-msg",
                    "REPLY": "reply-msg",
                    "RECOMMEND": "recommend-msg",
                    "ADVERTISING": "advertising-msg"
                },
                msgList: [],
                scrollState: true, // 是否可以滑动
                loaded: false,
                page: 0,
                rows: 10,
                constant: this.$store.state,
                staffState: false,
                listMore: true,
                //显示遮挡层
                showShelterList: [],
            }
        },
        created() {
            let _this = this;
            window.SD = function (tag) {
                _this.selfSendMsg({'tag': tag})
            };
            //监听消息
            this.sockets.subscribe(this.constant.SocketEvent.CHAT_MSG, data => {
                //输入状态同步结果显示处理
                if(this.$show.handleInputIng(this,data,true)){
                    return;
                }
                this.showMsgData(data);
            });
            //监听消息
            this.sockets.subscribe(this.constant.SocketEvent.INPUT_STATE_SYNC, data => {
                if (this.constant.activeUserId === data.userId) {
                    //输入状态同步显示处理
                    this.$show.handleInputIng(this,data);
                }
            });
            //处理路由直接跳转到页面时的情况
            if (this.constant.activeUserId > 0) {
                this.updateActiveUser(this.constant.activeUserId);
            }
        },
        methods: {
            //点击推荐
            clickRecommend: function (item) {
                this.selfSendMsg({'tag': item})
            },
            //发送消息
            selfSendMsg: function (obj) {
                if (obj.onlySend) {
                    //只发送
                    this.requestSend(obj);
                    return;
                }
                //内置表情处理
                if(typeof(obj.tag)=='string') {
                    obj['data'] = obj.tag.replace(/\[:([0-9]{1,2}):\]/, "<img width='50px' src='/images/face/$1.jpeg'/>");
                    if (obj['data'] !== obj.tag) {
                        obj.type = 'face';
                    }
                }
                obj.class = this.MsgClass.SELF;
                obj.id = new Date().getTime();
                //显示消息
                this.constant.showScrollBottom = false;
                //强制滚动
                obj['forceScroll'] = true;
                this.msgList.push(obj);
                this.$show.scrollBottom(this);
                //请求发送
                if (!obj.onlyShow) {
                    //非只显示
                    this.requestSend(obj);
                }
            },
            //请求发送消息
            requestSend: function (obj) {
                let data = {
                    tag: this.$aes.encrypt(obj.tag),
                    userId: this.constant.activeUserId
                };
                if (obj.storageType) {
                    data['storageType'] = obj.storageType;
                }
                this.$ajax.post("/web/help/tag", data).then(res => {
                    res = res.data;
                    if (res.state === this.constant.MsgState.STAFF) {
                        this.showStaffHandle(res, obj);
                        return;
                    }
                }).catch(e => {
                    console.log(e);
                    if (obj.storageType === this.constant.StorageType.CLOUD_IMG || obj.storageType === this.constant.StorageType.CLOUD_FILE) {
                        obj.process = this.constant.ResultCode.ERROR_SEND;
                        return;
                    }
                    //回复消息为空时,操作本消息
                    obj.tag = "<s>" + obj.tag + "</s><span style='color:#D00;font-size: 14px'>(" + e.message + ")</span>";
                    obj.type = 'html';
                    obj.id = -obj.id;
                });
            },
            showStaffHandle: function (res, obj) {
                if (res.storageType === this.constant.StaffType.SEND) {
                    obj.id = res.result;
                    obj.staff = 1;
                    return;
                }

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
                this.getDbHelpMsg(page, userId);
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
                        if (callback) {
                            callback("加载成功");
                        }
                        setTimeout(() => {
                            this.showShelterList = this.msgList.slice(0, 10);
                        }, 500);
                    }
                    setTimeout(() => {
                        this.showMsgData(data,true);
                    }, 600);
                    setTimeout(() => {
                        this.showShelterList = [];
                    }, 800);
                });
            },
            //获取本地数据库消息
            getDbHelpMsg(page, userId) {
                this.$indexdb.getDataByIndex(this.$db, "help_msg", "userId", userId).then(data => {
                    //data排序
                    if (page > 1) {
                        return;
                    }
                    data.sort((a, b) => {
                        return b.id - a.id
                    });
                    let start = (page - 1) * this.rows;
                    let end = page * this.rows;
                    data = data.slice(start, end);
                    this.showMsgData(data,true);
                })
            },
            showMsgData(data,forceScroll) {
                if (!data) {
                    return;
                }
                if (!(data instanceof Array)) {
                    data = [data];
                }
                let temp = null;
                let msgObj = null;
                for (let i = 0; i < data.length; i++) {
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
                        tag: temp.msg,
                        class: temp.direct !== 1 ? this.MsgClass.SELF : this.MsgClass.REPLY,
                        createDate: temp.createDate,
                        storageType: temp.storageType,
                        process: null,
                    };

                    //内置表情处理
                    if(typeof(msgObj.tag)=='string') {
                        let oldTag = msgObj.tag;
                        msgObj.tag = oldTag.replace(/\[:([0-9]{1,2}):\]/, "<img width='50px' src='/images/face/$1.jpeg'>");
                        if (msgObj.tag !== oldTag) {
                            msgObj.type = 'html';
                        }
                    }
                    if(forceScroll){
                        //强制滚动
                        msgObj['forceScroll'] = true;
                    }
                    if (temp.info) {
                        msgObj['info'] = JSON.parse(temp.info);
                    }
                    this.msgList.splice(0, 0, msgObj);
                    this.msgList.sort((a, b) => {
                        return a.id - b.id
                    });
                    this.$show.scrollBottom(this,forceScroll);
                }
            },
            onRefresh(done) {
                if (this.listMore) {
                    this.getList(done);
                } else {
                    done("真的没有了");
                    this.showShelterList = [];
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
            },
            //激活用户变更
            updateActiveUser: function (id) {
                this.msgList = [];
                this.listMore = true;
                this.constant.showTool = false;
                this.constant.showScrollBottom = false;
                this.constant.activeMsgUnRead = 0;
                this.constant.showFooter = id > 0;
                if (id > 0) {
                    this.listHelpMsg(1, id);
                }
            },
            //滚动到底部
            scrollToBottom: function () {
                this.constant.showScrollBottom = false;
                this.$show.scrollBottom(this);
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
            //高度计算
            calcHeight: function () {
                let height = this.constant.windowSize.height - 80;
                if (this.constant.showTool) {
                    height -= 60;
                }
                if (this.constant.showFooter) {
                    height -= 50;
                }
                this.$show.scrollToBottom(this);
                return height + 'px';
            },
            //显示回到底部状态变更
            scrollBottomUpdate(){
                return this.constant.showScrollBottom;
            }
        },
        watch: {
            msgList: function () {
                this.$show.scrollBottom(this);
            },
            //待发送更新
            waitSend: function (obj) {
                if (obj) {
                    this.selfSendMsg(obj);
                }
            },
            //激活用户变更
            activeUser: function (id) {
                this.updateActiveUser(id);
            },
            //显示回到底部状态变更
            scrollBottomUpdate:function (val) {
                if(!val){
                    //未读消息清0
                    this.constant.activeMsgUnRead = 0;
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .body {
        background: rgba(65, 152, 199, 0.1);
        width: 100%;
        overflow: hidden;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */
        padding: 2px 0;
        position: relative;
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
    .mete-item>a,.mete-item b{
        color:#000;
        text-decoration: none;
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

    .msg-item-body-shelter {
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    .to-bottom {
        position: absolute;
        padding: 2px 20px 2px 5px;
        bottom: 5px;
        right: 12px;
        background-color: #FFF;
        height: 30px;
        text-align: left;
        line-height: 30px;
        background-size: 25px 25px;
        background-repeat: no-repeat;
        background-position-x: right;
        background-position-y: center;
        background-image: url("../assets/img/down.svg");
        width: auto;
        display: inline-block;
    }
    .to-bottom span{
        font-size: 14px;
        color: #0099CC;
    }
</style>
