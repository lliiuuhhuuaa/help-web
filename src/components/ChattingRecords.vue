<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="user-body" v-if="activeUser<0">
            <div class="mete-item"  v-for="item in helpUser" :key="item.userId" @click="activeUser=item.userId"><div>{{item.nickname?item.nickname:item.user?item.user:'未知用户名'}}</div><span>会话时间:{{new Date(item.createDate).format("yyyy-MM-dd HH:mm:ss")}}</span></div>
        </div>
        <div class="msg-item-body-shelter" v-if="activeUser>0&&showShelterList.length>0">
            <div class="msg-item" v-bind:class="item.class" v-for="item in showShelterList" v-bind:key="item.id">
                <ChatMsg :item="item"/>
            </div>
        </div>
        <MessageLoad :on-refresh="onRefresh" v-if="activeUser>0">
            <div class="msg-item" v-bind:class="item.class" v-for="item in msgList" v-bind:key="item.id">
                <ChatMsg :item="item"/>
            </div>
        </MessageLoad>
        <div class="back-list"><router-link to="./"><div class="back-item" :style="{width:backItemWidth}">返回主页</div></router-link><div class="back-item"  :style="{width:backItemWidth}" v-if="activeUser>0" @click="activeUser=-1,msgList=[]">返回列表</div></div>
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
                //帮助过的用户
                helpUser:[],
                //激活选择
                activeUser:-1,
                //返回项宽度
                backItemWidth:'calc(100% - 4)'
            }
        },
        created() {
            //获取帮助过的用户
            this.listHelpUser();
        },
        methods: {
            //点击推荐
            clickRecommend: function (item) {
                this.selfSendMsg({'tag': item})
            },

            //加载历史记录
            getList: function (callback) {
                let lastId = null;
                for (let key in this.msgList) {
                    if (this.msgList[key].staff) {
                        lastId = this.msgList[key].id;
                    }
                }
                this.listHelpMsg(this.page + 1, this.activeUser, lastId, callback);
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
                    console.log(data)
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
                    if (temp.userId !== this.activeUser) {
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
            //获取帮助过的用户
            listHelpUser: function () {
                this.$ajax.post("/staff/online/listHelpUser", {}, {
                    animation: this.constant.Animation.PART,
                    alertError: true
                }).then((data) => {
                   this.helpUser = data.data;
                   this.listMerchantUser();
                });
            },
            //获取帮助过的用户
            listMerchantUser: function () {
                let userIds = [];
                for(let i=0;i<this.helpUser.length;i++){
                    userIds.push(this.helpUser[i].userId);
                }
                this.$ajax.post("/merchant/user/listMerchantUser", userIds, {
                    alertError: true,
                    headers:{"Content-Type": 'application/json;charset=utf-8'},
                }).then((data) => {
                    data = data.data;
                    for(let i=0;i<data.length;i++){
                        for(let k=0;k<this.helpUser.length;k++){
                            if(data[i].id===this.helpUser[k].userId){
                                this.helpUser[k]['nickname'] = data[i].nickname;
                                this.helpUser[k]['user'] = data[i].user;
                                this.helpUser.splice(k,1,this.helpUser[k]);
                            }
                        }
                    }
                });
            },
        },
        computed: {
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
            //对话用户激活变更
            activeUserId(){
                return this.constant.activeUserId;
            },
            //显示回到底部状态变更
            scrollBottomUpdate(){
                return this.constant.showScrollBottom;
            }

        },
        watch: {
            //显示回到底部状态变更
            scrollBottomUpdate:function (val) {
                if(!val){
                    //未读消息清0
                    this.constant.activeMsgUnRead = 0;
                }
            },
            //激活用户变更
            activeUser:function (val) {
                if(val>0){
                    this.page = 0;
                    this.listMore = true;
                    this.listHelpMsg(1,val,null);
                }
                this.backItemWidth = window.innerWidth/(val>0?2:1)-4+'px';
            },
            activeUserId:function (val){
                if(val>0){
                    this.$router.push("./");
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .body {
        background: rgba(65, 152, 199, 0.1);
        height: 100%;
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
    .user-body {
        text-align: center;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .mete-item {
        width: auto;
        text-align: center;
        height: 50px;
        display: inline-block;
        white-space: nowrap;
        background-color: #FFF;
        margin: 10px;
        padding: 10px;
        border: 2px solid #FFF;
        border-radius: 5px;
        cursor: pointer;
    }

    .mete-item:hover {
        border: 2px solid #0099CC;
    }
    .msg-item-body-shelter {
        width: 100%;
        height: calc(100% - 50px);
        z-index: 10;
    }
    #refresh-scroll,.user-body{
        height: calc(100% - 50px);
    }
    .back-list .back-item{
        width: calc(100% - 4px);
        margin: 2px;
        display: inline-block;
        background: #0099CC;
        line-height:50px;
        color: #FFF;
        font-size: 16px;
        height: 50px;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
