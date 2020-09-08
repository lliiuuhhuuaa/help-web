<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="network-delay" :class="getDelayClass" v-if="this.constant.socketDelay!=null">FPS</div>
        <div class="msg-item-body-shelter" v-if="showShelterList.length>0">
            <div class="msg-item" v-bind:class="item.class" v-for="item in showShelterList" v-bind:key="item.id">
                <div v-if="item.class===MsgClass.RECOMMEND">
                    <div class="recommend-title">{{item.data.title}}</div>
                    <div v-for="(it,idx) in item.data.content" v-bind:key="it.indx" @click="clickRecommend(it)">
                        <div class="recommend-item">{{idx+1}}.{{it}}</div>
                    </div>
                </div>
                <div v-if="item.class===MsgClass.EVALUATE">
                    <div class="star-body">
                        <!--click与touchstart一起用兼容手机不需要锁定-->
                        <ul @mousemove="starMouseOver" @click="starSelectState" @touchstart="starSelectState">
                            <li class="star-item" v-bind:class="{'half':star>0,'full':star>1}" v-bind:value="1"></li>
                            <li class="star-item" v-bind:class="{'half':star>2,'full':star>3}" v-bind:value="2"></li>
                            <li class="star-item" v-bind:class="{'half':star>4,'full':star>5}" v-bind:value="3"></li>
                            <li class="star-item" v-bind:class="{'half':star>6,'full':star>7}" v-bind:value="4"></li>
                            <li class="star-item" v-bind:class="{'half':star>8,'full':star>9}" v-bind:value="5"></li>
                        </ul>
                        <div class="star-state" v-if="star>-1"><span
                                v-text="star<1?'极差':star<2?'差':star<4?'不满意':star<6?'一般吧':star<8?'挺好的':star<10?'很好':'极好'"></span>
                            <span class="star-num">{{star}}</span>分
                        </div>
                    </div>

                    <div class="text-body" v-if="evaluate>0">
                        <textarea class="text-input" v-model="evaluateText" placeholder="这里输入服务评价内容"
                                  maxlength="100"/>
                        <button class="star-submit-btn" @click="starSubmit">提交</button>
                    </div>
                    <div class="text-center" v-else>已经评价完成</div>

                </div>
                <div v-else-if="item.class===MsgClass.ADVERTISING">
                    <div class="advertising-img" v-if="item.data.img"><img v-bind:src="item.data.img"></div>
                    <div class="advertising-body">
                        <div class="advertising-title">
                            <div v-for="(it,index) in item.data.content" v-bind:key="it.classify"
                                 @click="switchList(index)"
                                 v-bind:class="{'active':advertising[advertisingIndex].classify===it.classify}">
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
                <ChatMsg v-else :item="item"/>
            </div>
        </div>
        <MessageLoad :on-refresh="onRefresh">
            <div class="msg-item" :class="item.class" v-for="item in msgList" :key="item.index">
                <div v-if="item.class===MsgClass.RECOMMEND">
                    <div class="recommend-title">{{item.data.title}}</div>
                    <div v-for="(it,idx) in item.data.content" v-bind:key="it.indx" @click="clickRecommend(it)">
                        <div class="recommend-item">{{idx+1}}.{{it}}</div>
                    </div>
                </div>
                <div v-if="item.class===MsgClass.EVALUATE">
                    <div class="star-body">
                        <!--click与touchstart一起用兼容手机不需要锁定-->
                        <ul @mousemove="starMouseOver" @click="starSelectState" @touchstart="starSelectState">
                            <li class="star-item" v-bind:class="{'half':star>0,'full':star>1}" v-bind:value="1"></li>
                            <li class="star-item" v-bind:class="{'half':star>2,'full':star>3}" v-bind:value="2"></li>
                            <li class="star-item" v-bind:class="{'half':star>4,'full':star>5}" v-bind:value="3"></li>
                            <li class="star-item" v-bind:class="{'half':star>6,'full':star>7}" v-bind:value="4"></li>
                            <li class="star-item" v-bind:class="{'half':star>8,'full':star>9}" v-bind:value="5"></li>
                        </ul>
                        <div class="star-state" v-if="star>-1"><span
                                v-text="star<1?'极差':star<2?'差':star<4?'不满意':star<6?'一般吧':star<8?'挺好的':star<10?'很好':'极好'"></span>
                            <span class="star-num">{{star}}</span>分
                        </div>
                    </div>

                    <div class="text-body" v-if="evaluate>0">
                        <textarea class="text-input" v-model="evaluateText" placeholder="这里输入服务评价内容"
                                  maxlength="100"/>
                        <button class="star-submit-btn" @click="starSubmit">提交</button>
                    </div>
                    <div class="text-center" v-else>已经评价完成</div>

                </div>
                <div v-else-if="item.class===MsgClass.ADVERTISING">
                    <div class="advertising-img" v-if="item.data.img"><img v-bind:src="item.data.img"></div>
                    <div class="advertising-body">
                        <div class="advertising-title">
                            <div v-for="(it,index) in item.data.content" v-bind:key="it.classify"
                                 @click="switchList(index)"
                                 v-bind:class="{'active':advertising[advertisingIndex].classify===it.classify}">
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
                <ChatMsg v-else :item="item"/>
            </div>
        </MessageLoad>
        <div class="to-bottom point" v-if="constant.showScrollBottom" @click="scrollToBottom">回到底部</div>
    </div>

</template>

<script>
    import MessageLoad from "./MessageLoad";
    import ChatMsg from "./ChatMsg";

    export default {
        name: 'MessageBody',
        props: {
            hideHeader: Boolean
        },
        components: {
            ChatMsg,
            MessageLoad,
        },
        data() {
            return {
                MsgClass: {
                    "SELF": "self-msg",
                    "REPLY": "reply-msg",
                    "RECOMMEND": "recommend-msg",
                    "ADVERTISING": "advertising-msg",
                    "EVALUATE": "evaluate-msg"
                },
                msgList: [],
                scrollState: true, // 是否可以滑动
                loaded: false,
                page: 0,
                rows: 10,
                constant: this.$store.state,
                listMore: true,
                //评价
                evaluate: -1,
                //当前星级
                star: -1,
                //评价内容
                evaluateText: "",
                //可选星
                selectStar: true,
                //显示遮挡层
                showShelterList: [],
            }
        },
        created() {
            let _this = this;
            window.SD = function (tag) {
                _this.selfSendMsg({'tag': tag})
            };
        },
        methods: {
            //登陆后初始化
            loginAfter: function () {
                //获取当前人工客服状态
                this.getCurrStaffState();
                //监听消息
                this.sockets.subscribe(this.constant.SocketEvent.CHAT_MSG, data => {
                    //缓存数据
                    this.$indexdb.putData(this.$db, "help_msg", data);
                    //输入状态同步结果显示处理
                    if(this.$show.handleInputIng(this,data,true)){
                        return;
                    }
                    this.showMsgData(data, true);
                });
                //监听消息
                this.$store.commit("listenUpdateData", this);
                //监听消息
                this.sockets.subscribe(this.constant.SocketEvent.INPUT_STATE_SYNC, data => {
                    //输入状态同步显示处理
                    this.$show.handleInputIng(this,data);
                });
            },

            //获取当前人工客服状态
            getCurrStaffState: function () {
                this.$ajax.post("/web/staff/online/getCurrStaffInfo", {}).then(res => {
                    this.constant.staffState = res.data != null;
                    this.constant.staffInfo = res.data;
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
                        this.$show.scrollBottom(this);
                    }
                });
            },
            showMsgData(data, after,forceScroll) {
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
                        tag: temp.msg,
                        class: temp.direct !== 1 ? this.MsgClass.REPLY : this.MsgClass.SELF,
                        createDate: temp.createDate,
                        storageType: temp.storageType,
                        process: null,
                    };
                    if (temp.info) {
                        msgObj['info'] = JSON.parse(temp.info);
                    }
                    if(forceScroll){
                        //强制滚动
                        msgObj['forceScroll'] = true;
                    }
                    if (after) {
                        this.msgList.push(msgObj);
                    } else {
                        this.msgList.splice(0, 0, msgObj);
                    }
                    this.msgList.sort((a, b) => {
                        if (this.scrollState || a.id < 1 || b.id < 1) {
                            return 0;
                        }
                        return a.id - b.id
                    });
                    this.$show.scrollBottom(this);
                }
            },
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
                obj.class = this.MsgClass.SELF;
                obj.id = new Date().getTime();
                //强制更新
                obj['forceScroll'] = true;
                //显示消息
                this.msgList.push(obj);
                this.$show.scrollBottom(this);
                //发送消息
                let reply = null;
                if (!this.constant.staffState) {
                    reply = {
                        class: this.MsgClass.REPLY,
                        tag: '正在输入...',
                    };
                    this.constant.showScrollBottom = false;
                    this.msgList.push(reply);
                    this.$show.scrollBottom(this);
                }
                //请求发送
                if (!obj.onlyShow) {
                    //非只显示
                    this.requestSend(obj, reply);
                }

            },
            //请求发送消息
            requestSend: function (obj, reply) {
                let data = {
                    tag: this.$aes.encrypt(obj.tag),
                };
                if (obj.storageType) {
                    data['storageType'] = obj.storageType;
                }
                this.$ajax.post("/web/help/tag", data).then(res => {
                    res = res.data;
                    if (res.reply) {
                        res.reply = this.$aes.decrypt(res.reply);
                    }
                    if (res.state === this.constant.MsgState.DANGER) {
                        reply.tag = res.reply;
                        this.$show.scrollBottom(this);
                        return;
                    }
                    if (res.state === this.constant.MsgState.WAIT) {
                        reply.tag = "小六子解决不了,已经将您的问题提交给客服,请耐心等待回复哦！！！";
                        this.$show.scrollBottom(this);
                        return;
                    }
                    if (res.state === this.constant.MsgState.OK) {
                        this.showMsgHandle(reply, res);
                        this.$show.scrollBottom(this);
                        return;
                    }
                    if (res.state === this.constant.MsgState.STAFF) {
                        this.showStaffHandle(reply, res, obj);
                        this.$show.scrollBottom(this);
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
                        this.$show.scrollBottom(this);
                    }
                }).catch(e => {
                    if (reply != null) {
                        //回复消息不为空
                        reply.tag = e.message;
                        this.$show.scrollBottom(this);
                    }
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
                lastId = lastId && lastId > 0 ? lastId : null;
                page = page ? page : 1;
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
                    if (callback) {
                        callback("加载成功");
                    }
                    setTimeout(() => {
                        this.showShelterList = this.msgList.slice(0, 10);
                    }, 500);
                    setTimeout(() => {
                        this.showMsgData(data,null,true);
                    }, 600);
                    setTimeout(() => {
                        this.showShelterList = [];
                    }, 800);
                });
            },
            onRefresh(done) {
                if (this.listMore) {
                    this.getList(done);
                } else {
                    done("真的没有了");
                    this.showShelterList = [];
                }
            },
            //评星鼠标经过
            starMouseOver: function (e) {
                if (this.evaluate < 0 || !this.selectStar) {
                    return;
                }
                let curr = Math.round((e.layerX - 5) / 17);
                this.star = curr > 10 ? 10 : curr < 1 ? 0 : curr;
            },
            //手机兼容pc选星状态控制
            starSelectState: function (e) {
                if ((e instanceof MouseEvent) || !this.selectStar) {
                    this.selectStar = !this.selectStar;
                }
            },
            //评价提交
            starSubmit: function () {
                if (this.evaluate < 0) {
                    return;
                }
                if (this.star < 0) {
                    return;
                }
                this.$ajax.post("/web/staff/online/evaluateStaff", {
                    star: this.star,
                    evaluateText: this.evaluateText,
                    id: this.evaluate
                }, {animation: this.$store.state.Animation.PART, alertError: true}).then(() => {
                    this.evaluate = -1;
                    this.evaluateText = "";
                });
            },
            //滚动到底部
            scrollToBottom: function () {
                this.constant.showScrollBottom = false;
                this.$show.scrollBottom(this);
            }
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
            //高度计算
            calcHeight: function () {
                let height = this.constant.windowHeight - 100;
                if (!this.hideHeader) {
                    height -= 50;
                }
                if (this.constant.showTool) {
                    height -= 60;
                }
                if (this.constant.staffWaitCount > 0) {
                    height -= 50;
                }
                this.$show.scrollToBottom(this);
                return height + 'px';
            },
            exitWaitList() {
                return this.constant.staffWaitCount;
            },
            //客服信息变更
            staffInfoUpdate() {
                return this.constant.staffInfo;
            },
            //获取延迟
            getDelayClass(){
                if(this.$store.state.socketDelay<0){
                    return 'zero';
                }
                if(this.$store.state.socketDelay<10){
                    return 'five';
                }
                if(this.$store.state.socketDelay<20){
                    return 'four';
                }
                if(this.$store.state.socketDelay<40){
                    return 'three';
                }
                if(this.$store.state.socketDelay<80){
                    return 'two';
                }
                return 'one';
            }
        },
        watch: {
            login: function (val) {
                if (val) {
                    //登陆成功初始化数据
                    this.initData();
                    this.loginAfter();
                }
            },
            msgList: function () {
                this.$show.scrollBottom(this);
            },
            //待发送更新
            waitSend: function (obj) {
                if (obj) {
                    this.selfSendMsg(obj);
                }
            },
            //客服信息变更
            staffInfoUpdate: function (obj) {
                let reply = {id: -new Date(), class: this.MsgClass.REPLY};
                if (obj) {
                    reply['tag'] = '您好,客服【' + (obj.nickname ? obj.nickname : obj.username) + '】为您竭诚服务';
                } else {
                    reply['tag'] = '感谢使用,服务已完成,请对本次服务进行评分';
                }
                this.msgList.push(reply);
            },
            evaluate: function (obj) {
                if (obj > 0) {
                    for (let i = 0; i < this.msgList.length; i++) {
                        if (this.msgList[i].class === this.MsgClass.EVALUATE) {
                            this.msgList.splice(i, 1);
                            break;
                        }
                    }
                    this.star = -1;
                    this.evaluateText = "";
                    let reply = {id: -(new Date() + 2), class: this.MsgClass.EVALUATE, tag: obj};
                    this.msgList.push(reply);
                }
            },
            //退出排队
            exitWaitList: function (val, old) {
                if (val < 1 && val < old && !this.constant.staffState) {
                    let reply = {id: -new Date(), class: this.MsgClass.REPLY, tag: '已退出人工客服排队,现在可以使用自助服务'};
                    this.msgList.push(reply);
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
        height: calc(100vh - 150px);
        overflow: hidden;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */
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

    .msg-item.reply-msg, .msg-item.evaluate-msg {
        text-align: left;
        margin-right: 20%;
    }

    .reply-msg > div, .evaluate-msg > div {
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 18px 0;
    }

    .recommend-msg {
        text-align: left;
        margin-right: 20%;
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


    .star-body {
        height: 35px;
        position: relative;
        padding: 5px 10px;
    }

    .star-body ul {
        height: 35px;
        padding: 0 0 0 5px;
        margin: 0;
        text-align: center;
        display: inline-block;
    }

    .star-body .star-state {
        position: absolute;
        right: 5px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        display: inline-block;
    }

    .star-state .star-num {
        font-size: 20px;
        font-weight: bold;
        color: #4198C8;
    }

    .star-body .star-item {
        width: 30px;
        text-align: center;
        height: 35px;
        line-height: 35px;
        display: inline-block;
        white-space: nowrap;
        padding: 2px;
        border-radius: 5px;
        background-size: 30px 30px;
        background-repeat: no-repeat;
        background-position-x: center;
        background-image: url("../assets/img/star1.svg");
    }

    .star-body .star-item.half {
        background-image: url("../assets/img/star2.svg");
    }

    .star-body .star-item.full {
        background-image: url("../assets/img/star3.svg");
    }

    .text-body {
        width: 100%;
        height: 110px;
        text-align: center;
    }

    .text-body .text-input {
        padding: 5px;
        width: calc(100% - 10px);
        height: 60px;
        border-radius: 5px;
        border: 2px solid #5CC9F5;
        resize: none;
        outline: none;
        font-size: 16px;
    }

    .star-submit-btn {
        padding: 5px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background: rgba(120, 200, 240, 0.9);
        color: #FFF;
        font-size: 18px;
        outline-offset: -2px;
        outline-color: rgba(120, 200, 240, 0.9);
        box-shadow: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        width: 100px;
        display: inline-block;
    }

    .msg-item-body-shelter {
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    .to-bottom {
        position: absolute;
        padding: 2px 5px;
        bottom: 5px;
        right: 12px;
        background-color: #FFF;
        width: 80px;
        height: 30px;
        text-align: left;
        line-height: 30px;
        background-size: 25px 25px;
        background-repeat: no-repeat;
        background-position-x: 65px;
        background-position-y: center;
        background-image: url("../assets/img/down.svg");
    }
    .network-delay{
        padding: 2px;
        width: 20px;
        height: 30px;
        border-radius: 5px;
        position: fixed;
        right: 2px;
        top:2px;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position-x: center;;
        background-position-y: top;
        line-height: 50px;
        text-align: center;
        color: #FFF;
        font-size: 14px;
        z-index: 2;

    }
    .network-delay.five{
        background-image: url("../assets/img/signal5.svg");
    }
    .network-delay.four{
        background-image: url("../assets/img/signal4.svg");
    }
    .network-delay.three{
        background-image: url("../assets/img/signal3.svg");
    }
    .network-delay.two{
        background-image: url("../assets/img/signal2.svg");
    }
    .network-delay.one{
        background-image: url("../assets/img/signal1.svg");
    }
    .network-delay.zero{
        background-image: url("../assets/img/signal0.svg");
    }
</style>
