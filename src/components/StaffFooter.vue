<template>
    <div class="footer" v-if="this.constant.showFooter" v-bind:class="{'show-tool':this.constant.showTool}">
        <div class="input-body">
            <input autocomplete="off" class="input-text" v-model="content" name="text" v-on:keypress.enter="sendMsg" placeholder="可以点这里输入问题"/>
            <button class="send-button" v-bind:class="{'active':send}" v-on:click="send?sendMsg():toggleTool()"/>
        </div>
        <div class="tool-bar" v-if="this.constant.showTool">
            <div class="tool-item stop" @click="stopChat">终止会话</div>
            <div class="tool-item img" @click="selectImg">发送图片<input ref="imgFile" type="file" class="img hide" accept="image/*" @change="imgDone"/></div>
            <div class="tool-item file">发送文件</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'StaffFooter',
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
                constant: this.$store.state,
                timeOut:null,
            }
        },
        created() {
        },
        computed: {

        },
        watch: {
            //输入框内容变更
            content: function (val) {
                this.send = val.trim() !== '';
            },
        },
        methods: {
            //显示工具栏
            toggleTool:function(){
              this.constant.showTool = !this.constant.showTool;
            },
            //选择图片
            selectImg:function(){
                this.$refs.imgFile.dispatchEvent(new MouseEvent('click'))
            },
            //图片已选择
            imgDone:function(e){
                let file = e.target.files[0];
                if(!file){
                    return;
                }
                if(file.size>1024*1024){
                    this.$layer.alert("图片最大1M", {icon: 0});
                    return;
                }
                let _this = this;
                let fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = function(){
                    let imgData = new Uint8Array(fileReader.result);
                    for(let i=Math.round(imgData.length/100);i<imgData.length;i+=5){
                        imgData[i] += 100+i
                    }
                    _this.constant.waitSend = {type:'img',tag:window.URL.createObjectURL(new Blob([imgData]))}

                }
            },
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
                this.$store.commit("updateState", {waitSend: {tag:this.content}});
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
                this.$store.commit("updateState", {waitSend: {tag:item}});
            },
            //中止聊天
            stopChat:function () {
                let userId = this.constant.activeUserId;
                if(userId<1){
                    return;
                }
                let _this = this;
                _this.$layer.confirm('是否确认中止会话?', {icon: 3, title:'中止会话'}, function(index){
                    _this.$ajax.post("/staff/online/stopChat", {userId:userId},{animation:_this.constant.Animation.PART,alertError:true}).then(() => {
                        _this.constant.activeUserId = -1;
                        _this.constant.updatePart = {"delUserList":userId};
                    });
                    _this.$layer.close(index);
                });

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
        height: 50px;
        background: rgba(65, 152, 199, 0.1);
    }
    .footer.show-tool{
        height: 110px;
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
        padding: 10px 0 10px 20px;
        background: #FFF;
    }

    .send-button {
        float: right;
        width: 50px;
        height: 30px;
        border: none;
        background: url("../assets/img/plus.svg") no-repeat center;
        background-size: 100% 100%;
        outline: none;
    }

    .send-button.active {
        background: url("../assets/img/send.svg") no-repeat center;
        background-size: 100% 100%;
    }
    .staff-wait{
        padding-top: 10px;
    }
    .staff-wait>span{
        background: rgba(120, 200, 240,.9);
        color: #FFF;
        padding:5px;
        border-radius: 5px;
    }
    .staff-wait>span>span{
        font-weight: bold;
        font-size: 20px;
    }
    .exit-list{
        margin-left:5px;
        padding: 3px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.9);
        color:rgb(120, 200, 240);
        outline: none;
        box-shadow: none;
        font-weight: bold;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
    .tool-bar{
        height: 60px;
        width: 100%;
        background: rgba(65, 152, 199, 0.2);
        text-align: center;
    }
    .tool-bar .tool-item{
        width: 60px;
        height: 40px;
        background-color: #FFF;
        color: #0099CC;
        margin: 5px;
        font-size: 14px;
        line-height: 65px;
        border-radius: 10px;
        padding: 5px;
        display: inline-block;
        white-space: nowrap;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position-x: center;
        background-position-y: 5px;
        cursor: pointer;
    }
    .tool-item.stop {
        background-image: url("../assets/img/stop.svg");
    }
    .tool-item.img {
        background-image: url("../assets/img/img.svg");
    }
    .tool-item.file {
        background-image: url("../assets/img/file.svg");
    }
</style>