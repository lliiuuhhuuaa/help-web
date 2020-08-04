<template>
    <div class="body">
        <div class="msg-item" v-bind:class="item.class" v-for="item in msgList" v-bind:key="item.id">
            <div v-if="item.class==MsgClass.RECOMMEND">
                <div class="recommend-title">{{item.data.title}}</div>
                <div v-for="it in item.data.content" v-bind:key="it" @click="clickRecommend(it)">
                    <div class="recommend-item">{{it}}</div>
                </div>
            </div>
            <div v-else-if="item.class==MsgClass.ADVERTISING">
                <div class="advertising-img" v-if="item.data.img"><img v-bind:src="item.data.img"></div>
                <div class="advertising-title">
                    <div v-for="it in item.data.content" v-bind:key="it" @click="clickRecommend(it.title)">
                        {{it.title}}
                    </div>
                </div>
                <div class="advertising-list">
                    <div v-for="li in item.data.content[0].list" v-bind:key="li" @click="clickRecommend(li)">
                        {{li}}
                    </div>
                </div>

            </div>
            <div v-else>{{item.data}}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MessageBody',
        data(){
            return{
                MsgClass: {"SELF":"self-msg","REPLY":"reply-msg","RECOMMEND":"recommend-msg","ADVERTISING":"advertising-msg"},
                msgList:[]
            }
        },
        created() {
            let reply = {
                class:this.MsgClass.ADVERTISING,
                data:{"img":"../img/logo.png","content":[{"title":"变强",list:["人生在世","生离死别","悲欢离何"]},{"title":"赚钱",list:["如何变牛逼","baidu.com如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼"]}]},
                id:+new Date()
            };
            this.msgList.push(reply);
        },
        mounted() {
            this.Emit.$on("fromFooter",this.selfSendMsg)
        },
        methods:{
            //点击推荐
            clickRecommend:function(item){
                this.selfSendMsg({'msg':item})
            },
            //发送消息
            selfSendMsg:function (obj) {
                obj.class = this.MsgClass.SELF;
                obj.id = new Date().getTime();
                obj.replyId = obj.id+1;
                //请求发送
                this.requestSend(obj);
                //显示消息
                this.msgList.push(obj);
                this.scrollBottom();
                //发送消息
                let reply = {
                    class:this.MsgClass.REPLY,
                    data:'正在输入...',
                    id:+obj.replyId
                };
                this.msgList.push(reply);
                this.scrollBottom();
            },
            //请求发送消息
            requestSend:function(msg){
                let _this = this;
                setTimeout(function () {
                    _this.msgList.forEach(obj => {
                        if(obj.id==msg.replyId){
                            obj.data="不好意思，让您久等了";
                        }
                    })
                    if(Math.random()*10>5){
                        //发送消息
                        let reply = {
                            class:_this.MsgClass.RECOMMEND,
                            data:{"title":"你是要找这些吗,相关问题","content":["如何变富?","如何变牛逼","baidu.com如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼如何变牛逼"]},
                            id:+new Date()
                        };
                        _this.msgList.push(reply);
                        _this.scrollBottom();
                    }
                },1000);
            },
            //滚动到底部
            scrollBottom:function () {
                let el = this.$el;
                el.scrollTop = el.scrollHeight;
                setTimeout(function (){el.scrollTop = el.scrollHeight},200);
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .body {
        background: rgba(65, 152, 199, 0.2);
        width: 100%;
        height: calc(100vh - 155px);
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none; /* firefox */
        -ms-overflow-style: none; /* IE 10+ */
    }
    .body::-webkit-scrollbar {
        display: none; /* Chrome Safari */
    }
    .msg-item{
        margin-top: 10px;
        font-size: 16px;
        padding:10px;
        word-break:break-all;
        word-wrap:break-word;
    }
    .msg-item>div{
        border-radius: 18px 18px 18px 18px;
        font-size: 16px;
        padding:16px;
        background: #FFF;
        text-align: left;
    }
    .msg-item.self-msg{
        text-align: right;
        margin-left: 50px;
    }
    .self-msg>div{
        color: #FFF;
        background: #5CC9F5;
        text-align: left;
        word-break:break-all;
        word-wrap:break-word;
        border-radius: 18px 18px 0 18px;
    }
    .msg-item.reply-msg{
        text-align: left;
        margin-right: 50px;
    }
    .reply-msg>div{
        word-break:break-all;
        word-wrap:break-word;
        border-radius: 18px 18px 18px 0;
    }
    .recommend-msg{
        text-align: left;
    }
    .recommend-title{
        color:#999;
        padding-bottom: 10px;
        border-bottom: 1px solid #EEE;
    }
    .recommend-item{
        color:dodgerblue;
        cursor: pointer;
        margin-top: 10px;
    }
    .advertising-title{
        border-bottom: 1px solid #EEE;
        padding-bottom: 10px;
    }
    .advertising-title>div{
        margin-right: 10px;
        display: inline;
        font-weight: bold;
        font-size: 18px;
        padding-bottom: 10px;
    }
    .advertising-title>div.active{
        color: #0099CC;
        border-bottom: 2px solid #0099CC;
    }
    .advertising-list>div{
        cursor: pointer;
        border-bottom: 2px dotted #EEE;
        padding: 10px;
    }
</style>
