<template>
    <div class="body" v-bind:class="{'hide-header':hideHeader,'staff-wait-state':this.constant.staffWaitCount>0}">
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

    export default {
        name: 'MessageBody',
        props: {
            hideHeader: Boolean
        },
        components: {
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
                listMore: true,
                //客服信息
                staffInfo:null,
            }
        },
        created() {
            let _this = this;
            window.SD = function (tag) {
                _this.selfSendMsg({'tag': tag})
            }
            //获取当前人工客服状态
            this.getCurrStaffState();
            //监听消息
            this.sockets.subscribe("chatMsg", data => {
                //缓存数据
                this.$indexdb.putData(this.$db, "help_msg", data);
                this.showMsgData(data,true);
            });
            //监听消息
            this.$store.commit("listenUpdateData", this);
        },
        methods: {
            //获取当前人工客服状态
            getCurrStaffState: function () {
                this.$ajax.post("/web/staff/online/getCurrStaffState", {}).then(res => {
                    this.constant.staffState = res.data;
                })
            },
            initData: function () {
                this.$ajax.post("/web/merchant/getHelpIndividuality", {}).then(res => {
                    res = res.data;
                    if (res.helpTags != null && res.helpTags.length > 0) {
                        //添加推荐问题
                        let reply = {
                            class: this.MsgClass.ADVERTISING,
                            data: {
                                img: res.advertising,
                                content: res.helpTags
                            },
                            id: -new Date()
                        };
                        this.advertising = reply.data.content;

                        this.advertisingIndex = 0;
                        this.msgList.push(reply);
                    }
                    if (res.commons) {
                        this.$store.commit("updateState", {commons: res.commons.split(",")});
                    }
                    let reply = {
                        class: this.MsgClass.REPLY,
                        tag: res.greeting,
                        id: -res.createDate
                    };
                    this.msgList.push(reply);
                    //检查是否处理等待人工
                    if (this.constant.staffWaitCount > 0) {
                        let reply = {
                            class: this.MsgClass.REPLY,
                            tag: '正在等待分配客服,您可以先描述问题,客服分配后能及时了解问题',
                        };
                        this.msgList.push(reply);
                        this.scrollBottom();
                    }
                });
            },
            showMsgData(data,after) {
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
                        class: temp.direct === 1 ? this.MsgClass.SELF : this.MsgClass.REPLY,
                        tag: temp.msg + "<span style='font-size: 14px;position: absolute;top: -5px;" + (temp.direct === 1 ? "right" : "left") + ": 20px;color: #999;'>" + new Date(temp.createDate).format('yyyy-MM-dd HH:mm:ss') + "</span>",
                        type: 'html'
                    };
                    if(after){
                        this.msgList.push(msgObj);
                    }else{
                        this.msgList.splice(0, 0, msgObj);
                    }
                    this.msgList.sort((a, b) => {
                        if(this.scrollState||a.id<1||b.id<1){
                            return 0;
                        }
                        return a.id - b.id
                    });
                    this.scrollBottom();
                }
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
                //发送消息
                let reply = null;
                if (!this.constant.staffState) {
                    reply = {
                        class: this.MsgClass.REPLY,
                        tag: '正在输入...',
                    };
                    this.msgList.push(reply);
                    this.scrollBottom();
                }
                //请求发送
                this.requestSend(obj, reply);
            },
            //请求发送消息
            requestSend: function (obj, reply) {
                this.$ajax.post("/web/help/tag", {tag: this.$aes.encrypt(obj.tag)}).then(res => {
                    res = res.data;
                    if (res.reply) {
                        res.reply = this.$aes.decrypt(res.reply);
                    }
                    if (res.state === this.constant.MsgState.DANGER) {
                        reply.tag = res.reply;
                        this.scrollBottom();
                        return;
                    }
                    if (res.state === this.constant.MsgState.WAIT) {
                        reply.tag = "小六子解决不了,已经将您的问题提交给客服,请耐心等待回复哦！！！";
                        this.scrollBottom();
                        return;
                    }
                    if (res.state === this.constant.MsgState.OK) {
                        this.showMsgHandle(reply, res);
                        this.scrollBottom();
                        return;
                    }
                    if (res.state === this.constant.MsgState.STAFF) {
                        this.showStaffHandle(reply, res, obj);
                        this.scrollBottom();
                        return;
                    }
                    if (res.state === this.constant.MsgState.RECOMMEND) {
                        reply.tag = "我猜您是要问这些吗?";
                        let recommend = {
                            class: this.MsgClass.RECOMMEND,
                            data: {
                                title: "为您找到相关问题",
                                content: res.result
                            },
                            id: +new Date()
                        };
                        this.msgList.push(recommend);
                        this.scrollBottom();
                    }
                }).catch(e => {
                    if (reply != null) {
                        //回复消息不为空
                        reply.tag = e.message;
                        this.scrollBottom();
                    }
                    //回复消息为空时,操作本消息
                    obj.tag = "<s>" + obj.tag + "</s><span style='color:#D00;font-size: 14px'>(" + e.message + ")</span>";
                    obj.type = 'html';
                });
            },
            showMsgHandle: function (reply, res) {
                if (res.storageType === this.constant.StorageType.DB || res.storageType === this.constant.StorageType.PC) {
                    reply.tag = res.reply;
                    return;
                }
                if (res.storageType === this.constant.StorageType.HTML) {
                    reply.tag = res.reply;
                    reply['type'] = 'html';
                    return;
                }
                if (res.storageType === this.constant.StorageType.FILE) {
                    this.$ajax.get("/other/file/getGeneralFile/" + res.reply, {}).then(res => {
                        reply['type'] = 'html';
                        reply.tag = res;
                    });
                    return;
                }
                if (res.storageType === this.constant.StorageType.URL) {
                    reply.tag = "正在为您访问:" + res.reply;
                    let urlData = {
                        class: this.MsgClass.REPLY,
                        tag: '<iframe src="' + res.reply + '" width="100%" height="400px" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto" allowtransparency="yes">',
                        type: 'html',
                        id: +new Date()
                    };
                    this.msgList.push(urlData);
                    return;
                }
                if (res.storageType === this.constant.StorageType.PC2) {
                    let arr = res.reply.split("|");
                    reply.type = 'ask_answer';
                    reply.tag = arr;
                    return;
                }
                if (res.storageType === this.constant.StorageType.RECOMMEND) {
                    reply.tag = "来看看这些";
                    let recommend = {
                        class: this.MsgClass.RECOMMEND,
                        data: JSON.parse(res.reply),
                        id: +new Date()
                    };
                    this.msgList.push(recommend);
                    return;
                }
            },
            showStaffHandle: function (reply, res, obj) {
                if (res.storageType === this.constant.StaffType.WAIT) {
                    reply.tag = "请稍等,正在等待分配客服,您可以先描述问题,客服分配后能及时了解问题";
                    this.constant.staffWaitCount = res.reply;
                    this.constant.staffState = true;
                    return;
                }
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
                this.listHelpMsg(this.page + 1, lastId, callback);
            },
            //加载历史记录
            listHelpMsg: function (page, lastId, callback) {
                lastId = lastId && lastId>0? lastId : null;
                page = page ? page : 1;
                this.getDbHelpMsg(page, lastId);
                this.$ajax.post("/web/staff/online/listHelpMsg", {
                    page: page,
                    rows: this.rows,
                    lastId: lastId
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
                    if(page>1){
                        this.scrollState = false;
                        setTimeout(() => {
                            this.scrollState = true;
                        }, 2000);
                    }
                    this.showMsgData(data);
                    if (callback) {
                        callback("加载成功");
                    }
                });
            },
            //获取本地数据库消息
            getDbHelpMsg(page) {
                let userId = this.constant.userInfo.userId;
                this.$indexdb.getDataByIndex(this.$db, "help_msg", "userId", userId).then(data => {
                    //data排序
                    if(page>1){
                        this.scrollState = false;
                        setTimeout(() => {
                            this.scrollState = true;
                        }, 1000);
                    }
                    data.sort((a,b)=>{return b.id-a.id});
                    let start = (page-1)*this.rows;
                    let end = page*this.rows;
                    this.showMsgData(data.slice(start,end));
                })
            },
            onRefresh(done) {
                if (this.listMore) {
                    //记录当前滚动条位置
                    this.lastScrollHeight = document.getElementById("refresh-scroll").scrollHeight;
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
                }else{
                    //非可滚动状态,保持当前位置
                    let count = 10;
                    el.scrollTop = el.scrollHeight-this.lastScrollHeight;
                    let interval = setInterval(() => {
                        el.scrollTop = el.scrollHeight-this.lastScrollHeight;
                        if (--count < 0) {
                            clearInterval(interval);
                        }
                    }, 5)

                }

            },
        },
        computed: {
            //登陆状态更新
            login() {
                return this.constant.login;
            },
            //待发送更新
            waitSend() {
                return this.constant.waitSend;
            },
        },
        watch: {
            login: function (val) {
                if (val) {
                    //登陆成功初始化数据
                    this.initData();
                }
            },
            msgList: function () {
                if (this.scrollState) {
                    this.scrollBottom();
                }
            },
            //待发送更新
            waitSend: function (obj) {
                this.selfSendMsg(obj);
            },
            //客服信息变更
            staffInfo:function (obj) {
                console.log(obj);
                let reply = {id:-new Date(),class:this.MsgClass.REPLY};
                if(obj){
                    reply['tag']='您好,客服【'+(obj.nickname?obj.nickname:obj.username)+'】为您竭诚服务';
                }else{
                    reply['tag']='感谢使用,服务已完成,请对本次服务进行评分';
                }
                this.msgList.push(reply);
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
        height: calc(100vh - 150px);
        overflow: hidden;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */
    }

    .body.hide-header.staff-wait-state {
        height: calc(100vh - 130px);
    }

    .body.staff-wait-state {
        height: calc(100vh - 180px);
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
        margin-left: 50px;
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
        margin-right: 50px;
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
</style>
