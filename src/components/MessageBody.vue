<template>
    <div class="body" v-bind:class="{'hide-header':hideHeader}">
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
                <div v-else>{{item.tag}}</div>
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
                iPage: 1,
                iPageSize: 10,
            }
        },
        mounted() {
                this.Emit.$on("fromFooter", this.selfSendMsg),
                this.Emit.$on("bodyToBottom", this.scrollBottom)
        },
        methods: {
            initData:function(){
                this.$ajax.post("/web/merchant/getHelpIndividuality", {}).then(res => {
                    res = res.data;
                    if(res.helpTags!=null&&res.helpTags.length>0){
                        //添加推荐问题
                        let reply = {
                            class: this.MsgClass.ADVERTISING,
                            data: {
                                img: res.advertising,
                                content: res.helpTags
                            },
                            id: +new Date()
                        };
                        this.advertising = reply.data.content;

                        this.advertisingIndex = 0;
                        this.msgList.push(reply);
                    }
                    if(res.commons){
                        this.$store.commit("updateState",{commons:res.commons.split(",")});
                    }
                    console.log(res);
                    let reply = {
                        class: this.MsgClass.REPLY,
                        tag: res.greeting,
                        id: res.createDate
                    };
                    this.msgList.push(reply);
                });
            },
            //点击推荐
            clickRecommend: function (item) {
                this.selfSendMsg({'tag': item})
            },
            //发送消息
            selfSendMsg: function (obj) {
                obj.class = this.MsgClass.SELF;
                obj.id = new Date().getTime();
                obj.replyId = obj.id + 1;
                //显示消息
                this.msgList.push(obj);
                this.scrollBottom();
                //发送消息
                let reply = {
                    class: this.MsgClass.REPLY,
                    tag: '正在输入...',
                    id: +obj.replyId
                };
                this.msgList.push(reply);
                this.scrollBottom();
                //请求发送
                this.requestSend(obj.tag,reply);
            },
            //请求发送消息
            requestSend: function (tag,reply) {
                this.$ajax.post("/web/help/tag", {tag:tag}).then(res => {
                    res = res.data;
                    reply.tag = res.reply;

                });
                // setTimeout(function () {
                //
                //     if (Math.random() * 10 > 5) {
                //         //发送消息
                //         let reply = {
                //             class: _this.MsgClass.RECOMMEND,
                //             data: {
                //                 "title": "你是要找这些吗,相关问题",
                //                 "content": ["如何变富?", "如何变牛逼", "baidu.com如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼"]
                //             },
                //             id: +new Date()
                //         };
                //         _this.msgList.push(reply);
                //         _this.scrollBottom();
                //     }
                // }, 1000);
            },
            //切换显示列表
            switchList: function (index) {
                this.advertisingIndex = index;
                //更新下标，强制更新视图
                this.$forceUpdate();
            },
            onScroll: function (e) {
                console.log(e.target.scrollTop);
            },
            //加载更多
            loadMore: function (done) {
                let vm = this;
                setTimeout(() => done(), 1000);
                console.log(vm)
                console.log(done)
            },
            getList() {

            },
            onRefresh(done) {
                this.getList();

                done() // call done

            },
            onInfinite(done) {
                setTimeout(() => done(), 1000);
            },
            //滚动到底部
            scrollBottom: function () {
                let el = document.getElementById("refresh-scroll");
                el.scrollTop = el.scrollHeight;
                setTimeout(function () {
                    el.scrollTop = el.scrollHeight
                }, 100);
            }
        },
        computed:{
            login(){
                return this.$store.state.login;
            }
        },
        watch:{
            login:function(val){
                if(val){
                    //登陆成功初始化数据
                    this.initData();
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
    }

    .body.hide-header {
        height: calc(100vh - 100px);
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
        text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,0.1), 0 0 5px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.3),0 3px 5px rgba(0,0,0,0.2),0 5px 10px rgba(0,0,0,0.25);
    }

    .advertising-list-right {
        width: calc(100% - 50px);
        height: 100%;
        float: right;
    }
</style>
