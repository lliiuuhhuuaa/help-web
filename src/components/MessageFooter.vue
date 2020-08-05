<template>
    <div class="footer">
        <ul class="common-word">
            <li v-for="item in words" :key="item" @click="sendQuickMsg(item)">
                {{item}}
            </li>
        </ul>
        <div class="input-body">
            <input class="input-text" v-model="content" name="text" v-on:keypress.enter="sendMsg" placeholder="可以点这里输入问题"/>
            <button class="send-button" v-bind:class="{'active':send}" v-on:click="sendMsg"></button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MessageFooter',
        data() {
            return {
                //输入内容
                content: "",
                //常见问题关键词
                words: ["怎么用?", "是吗", "怎么退出"],
                //发送按钮是否可用
                send: false,
                //上次发送时间
                prevSendTime:0,
            }
        },
        props: {
            msg: String
        },
        watch: {
            //输入框内容变更
            content: function (val) {
                this.send = val.trim() != '';
            }
        },
        methods: {
            //发送消息
            sendMsg: function () {
                if (!this.send) {
                    return;
                }
                let time = +new Date();
                if(this.prevSendTime+1000>time){
                    alert("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.Emit.$emit("fromFooter",{data:this.content});
                this.content = "";
            },
            sendQuickMsg:function (item){
                let time = +new Date();
                if(this.prevSendTime+1000>time){
                    alert("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.Emit.$emit("fromFooter",{data:item});
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: rgba(65, 152, 199, 0.2);
    }

    .common-word {
        text-align: left;
        padding: 0;
        height: 18px;
    }

    .common-word li {
        display: inline;
        border: 1px solid #0099CC;
        list-style: none;
        margin: 5px;
        padding: 5px;
        border-radius: 5px;
        cursor: pointer;
    }

    .input-text {
        float: left;
        height: 30px;
        width: calc(100% - 60px);
        border: 0;
        outline: none;
        font-size: 16px;
        background: #FFF;
        background: rgba(65, 152, 199, 0);
    }

    .input-body {
        height: 30px;
        padding: 10px 20px;
        background: #FFF;
    }

    .send-button {
        float: right;
        width: 50px;
        height: 30px;
        border: none;
        background: url("../assets/send_grey.svg") no-repeat center;
        background-size: 100% 100%;
        outline: none;
    }

    .send-button.active {
        background: url("../assets/send.svg") no-repeat center;
        background-size: 100% 100%;
    }
</style>