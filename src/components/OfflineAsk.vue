<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="user-body">
            <div v-if="waitAsk.length>0 && !activeAsk">
                <div class="mete-item" v-for="item in waitAsk" :key="item.index" @click="activeAsk=item">
                    <div>用户名:{{item.nickname?item.nickname:item.user?item.user:'未知用户名'}}</div>
                    <div class="ellipsis" v-html="item.tag.replace('问题','<br/>问题')"></div>
                    <span>提问时间:{{new Date(item.createDate).format("yyyy-MM-dd HH:mm:ss")}}</span></div>
            </div>
            <div v-if="activeAsk">
                <div class="mete-item mete-item-once" ref="meteItemOnce">
                    <div>用户名:{{activeAsk.nickname?activeAsk.nickname:activeAsk.user?activeAsk.user:'未知用户名'}}</div>
                    <div class="multi-line" v-html="activeAsk.tag.replace('问题','<br/>问题')"></div>
                </div>
                <div :style="{height:calcEditHeight}">
                    <div id="editor">
                    </div>
                </div>
            </div>
        </div>

        <div class="back-list">
            <router-link to="./">
                <div class="back-item" :style="{width:backItemWidth}" v-if="!activeAsk">返回主页</div>
            </router-link>
            <div class="back-item" :style="{width:backItemWidth}" v-if="activeAsk" @click="activeAsk=null">返回列表</div>
            <div class="back-item" :style="{width:backItemWidth}" v-if="activeAsk" @click="activeAsk=null">提交</div>
        </div>
    </div>

</template>

<script>
    import WangEditor from 'wangeditor'
    export default {
        name: 'StaffBody',
        props: {},
        components: {},
        data() {
            return {
                loaded: false,
                page: 0,
                rows: 10,
                constant: this.$store.state,
                staffState: false,
                listMore: true,
                //显示遮挡层
                showShelterList: [],
                //帮助过的用户
                waitAsk: [],
                //激活选择
                activeAsk: null,
                //返回项宽度
                backItemWidth: 'calc(100% - 4)',
                //item高度
                itemHeight:0,
            }
        },
        created() {
            //获取帮助过的用户
            this.listWaitAsk();
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
                if (typeof (obj.tag) == 'string') {
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
                        this.showMsgData(data, true);
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
                    this.showMsgData(data, true);
                })
            },
            showMsgData(data, forceScroll) {
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
                    if (typeof (msgObj.tag) == 'string') {
                        let oldTag = msgObj.tag;
                        msgObj.tag = oldTag.replace(/\[:([0-9]{1,2}):\]/, "<img width='50px' src='/images/face/$1.jpeg'>");
                        if (msgObj.tag !== oldTag) {
                            msgObj.type = 'html';
                        }
                    }
                    if (forceScroll) {
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
                    this.$show.scrollBottom(this, forceScroll);
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
            listWaitAsk: function () {
                this.$ajax.post("/wait/ask/listWaitAsk", {}, {
                    animation: this.constant.Animation.PART,
                    alertError: true
                }).then((data) => {
                    data = data.data;
                    this.waitAsk = data.rows;
                    this.listMerchantUser();
                });
            },
            //获取帮助过的用户
            listMerchantUser: function () {
                let userIds = [];
                for (let i = 0; i < this.waitAsk.length; i++) {
                    userIds.push(this.waitAsk[i].userId);
                }
                if (userIds.length < 1) {
                    return;
                }
                this.$ajax.post("/merchant/user/listMerchantUser", userIds, {
                    alertError: true,
                    headers: {"Content-Type": 'application/json;charset=utf-8'},
                }).then((data) => {
                    data = data.data;
                    if (!data) {
                        return;
                    }
                    for (let i = 0; i < data.length; i++) {
                        for (let k = 0; k < this.waitAsk.length; k++) {
                            if (data[i].id === this.waitAsk[k].userId) {
                                this.waitAsk[k]['nickname'] = data[i].nickname;
                                this.waitAsk[k]['user'] = data[i].user;
                                this.waitAsk.splice(k, 1, this.waitAsk[k]);
                            }
                        }
                    }
                });
            },
            //滚动到底部
            scrollToBottom: function () {
                this.constant.showScrollBottom = false;
                this.$show.scrollBottom(this);
            }
        },
        computed: {
            //高度计算
            calcHeight: function () {
                let height = this.constant.windowHeight - 80;
                if (this.constant.showTool) {
                    height -= 60;
                }
                if (this.constant.showFooter) {
                    height -= 50;
                }
                this.$show.scrollToBottom(this);
                return height + 'px';
            },
            //计算编辑器高度
            calcEditHeight: function () {
                let height = this.constant.windowHeight - 80-54-20;
                height -= this.itemHeight;
                console.log(this.itemHeight)
                console.log(height)
                return height + 'px';
            },
            //显示回到底部状态变更
            scrollBottomUpdate() {
                return this.constant.showScrollBottom;
            },
            //对话用户激活变更
            activeUserId() {
                return this.constant.activeUserId;
            },
        },
        watch: {
            //显示回到底部状态变更
            scrollBottomUpdate: function (val) {
                if (!val) {
                    //未读消息清0
                    this.constant.activeMsgUnRead = 0;
                }
            },
            //激活用户变更
            activeAsk: function (val) {
                if(val){
                    this.$nextTick(()=>{
                        var editor = new WangEditor('#editor');
                        // 使用 base64 保存图片
                        editor.customConfig.uploadImgShowBase64 = true;
                        editor.create();
                        this.itemHeight = this.$refs.meteItemOnce.offsetHeight;
                    })
                }
                this.backItemWidth = window.innerWidth / (val? 2 : 1) - 4 + 'px';
            },
            activeUserId: function (val) {
                if (val > 0) {
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

    .user-body {
        text-align: center;
        height: calc(100% - 50px);
        overflow-y: auto;
        overflow-x: hidden;
    }

    .mete-item {
        width: auto;
        min-width: 250px;
        max-width: 40%;
        text-align: left;
        height: auto;
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

    .mete-item-once {
        width: calc(100% - 44px);
        min-width: auto;
        max-width: none;
    }
    .back-list .back-item {
        width: calc(100% - 4px);
        margin: 2px;
        display: inline-block;
        background: #0099CC;
        line-height: 50px;
        color: #FFF;
        font-size: 16px;
        height: 50px;
        border-radius: 5px;
        cursor: pointer;
    }
    #editor{
        height: 100%;
    }
</style>
<style>
    #editor .w-e-toolbar{
        overflow-x: auto;
    }
    #editor .w-e-text-container{
        height: calc(100% - 34px) !important;
        overflow: auto;
        background: #FFF;
    }
</style>