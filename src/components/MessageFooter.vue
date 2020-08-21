<template>
    <div class="footer" v-bind:class="{'focusState':keyboard}">
        <ul class="common-word">
            <li v-for="item in this.$store.state.commons" :key="item" @click="sendQuickMsg(item)">
                {{item}}
            </li>
        </ul>
        <div class="input-body">
            <input class="input-text" v-model="content" name="text" v-on:keypress.enter="sendMsg" placeholder="可以点这里输入问题"/>
            <button class="send-button" v-bind:class="{'active':send}" v-on:click="sendMsg"/>
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
                //发送按钮是否可用
                send: false,
                //上次发送时间
                prevSendTime:0,
                //是否正在使用键盘
                keyboard:false,
            }
        },
        watch: {
            //输入框内容变更
            content: function (val) {
                this.send = val.trim() !== '';
            }
        },
        // created() {
        //     let _this = this;
        //     //let clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        //     let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        //     let y = document.getElementsByClassName("input-text")[0].getBoundingClientRect().y
        //     window.addEventListener('resize', function () {
        //         //let nowClientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        //         //let nowClientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        //         if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {//因为ios有自带的底部高度
        //            alert(y)
        //            alert(document.activeElement.getBoundingClientRect().y)
        //            alert(y-document.activeElement.getBoundingClientRect().y)
        //             let height = clientHeight-document.activeElement.getBoundingClientRect().y;
        //             this.footMargin = height;
        //             /*_this.keyboard = true;*/
        //             _this.Emit.$emit("appToBottom");
        //             _this.Emit.$emit("bodyToBottom");
        //             alert(height);
        //             //处理部分输入框遮挡的问题
        //             /*if(clientHeight-nowClientHeight<200){
        //                 _this.keyboard = true;
        //                 _this.Emit.$emit("appToBottom");
        //                 _this.Emit.$emit("bodyToBottom");
        //             }*/
        //
        //         }else{
        //             _this.keyboard = false;
        //         }
        //     })
        // },
        methods: {
            //发送消息
            sendMsg: function () {
                if (!this.send) {
                    return;
                }
                let time = +new Date();
                if(this.prevSendTime+1000>time){
                    this.$layer.msg("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.Emit.$emit("fromFooter",{tag:this.content});
                this.content = "";
            },
            sendQuickMsg:function (item){
                let time = +new Date();
                if(this.prevSendTime+1000>time){
                    this.$layer.msg("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.Emit.$emit("fromFooter",{tag:item});
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: rgba(65, 152, 199, 0.1);
    }
    .focusState{
        margin-bottom: 70px;
    }
    .common-word {
        text-align: left;
        padding: 15px 10px;
        height: 18px;
        margin:0;
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
        background: url("../assets/img/send_grey.svg") no-repeat center;
        background-size: 100% 100%;
        outline: none;
    }

    .send-button.active {
        background: url("../assets/img/send.svg") no-repeat center;
        background-size: 100% 100%;
    }
</style>