<template>
    <div class="footer" v-if="this.constant.showFooter" :style="{height:calcHeight}">
        <div class="staff-wait" v-if="!staff&&this.constant.staffWaitCount>0"><span>人工客服排队:您当前在第 <span>{{this.constant.staffWaitCount}}</span> 位<button
                class="exit-list" @click="exitWaitList">退出排队</button></span></div>
        <ul v-if="!staff" class="common-word">
            <li v-for="item in this.$store.state.commons" :key="item" @click="sendQuickMsg(item)">
                {{item}}
            </li>
        </ul>
        <div class="stop-notice" v-if="this.constant.stopUserId.indexOf(this.constant.activeUserId)>-1"><span>用户已中止会话</span><button @click="stopChat(true)">关闭会话</button></div>
        <div v-else>
            <div class="input-body">
                <button class="emoji-button" v-on:click="showEmoji=!showEmoji,constant.showTool = showEmoji"/>
<!--                <div spellcheck="true" class="input-text" name="text" v-on:keydown.enter.prevent="sendMsg"-->
<!--                     placeholder="可以点这里输入问题" contenteditable="true" v-html="content"></div>-->
                <input autocomplete="off" class="input-text" v-model="content" name="text" v-on:keypress.enter="sendMsg"
                       placeholder="可以点这里输入问题"/>
                <button class="send-button" v-bind:class="{'active':send}" v-on:click="send?sendMsg():toggleTool()"/>
            </div>
            <div class="tool-bar" v-if="this.constant.showTool">
                <ul class="emoji-body horizontal-scrolling" v-if="showEmoji" @mousedown.self="$show.horizontalScrolling">
                    <li class="emoji-item" v-for="index of 20" :key="index"><img :src="getEmojiUrl(index)" @click="sendEmojiMsg(index)" @mousedown.prevent="$show.horizontalScrolling"/></li>
                </ul>
                <div v-else>
                    <div class="tool-item stop" @click="stopChat" v-if="staff||this.constant.staffState">终止会话</div>
                    <div class="tool-item img" @click="selectFile" v-if="staff||this.constant.staffState">发送图片<input ref="file"
                                                                                                                     type="file"
                                                                                                                     class="hide"
                                                                                                                     accept="image/*"
                                                                                                                     @change="imgDone"/>
                    </div>
                    <div class="tool-item file" @click="selectFile" v-if="staff||this.constant.staffState">发送文件<input ref="file"
                                                                                                                      type="file"
                                                                                                                      class="hide"
                                                                                                                      @change="fileDone"/>
                    </div>
                    <div class="tool-item staff" @click="sendQuickMsg('人工客服')" v-if="!staff&&!this.constant.staffState">人工客服
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        props: {
            staff: Boolean,
        },
        name: 'StaffFooter',
        data() {
            return {
                //输入内容
                content: "",
                //发送按钮是否可用
                send: false,
                //上次发送时间
                prevSendTime: 0,
                constant: this.$store.state,
                timeOut: null,
                //上一次输入状态同步
                prevInputState: false,
                //显示表情栏
                showEmoji:false,
            }
        },
        created() {
            let _this = this;
            window.onunload=function(){
                //处理输入同步，页面将被刷新或被关闭的情况
                let userId = null;
                if(_this.staff){
                    userId = _this.constant.activeUserId;
                }else if(_this.constant.staffInfo!=null){
                    userId = _this.constant.staffInfo.userId;
                }
                if(userId){
                    _this.$socket.emit(_this.constant.SocketEvent.INPUT_STATE_SYNC,{userId:userId,state:false})
                }
            }
            window.onload = function () {
                //水平滚动初始化
             //   _this.$show.horizontalScrolling();
            }


        },
        methods: {
            //高度计算
            calcHeight: function () {
                let height = 50;
                if (this.constant.showTool) {
                    height += 60;
                }
                if (this.constant.staffWaitCount > 0) {
                    height += 80;
                }
                if (!this.staff) {
                    height += 50;
                }
                return height + 'px';
            },
            //显示工具栏
            toggleTool: function () {
                //已显示工具栏并且显示表情
                if(this.constant.showTool&&this.showEmoji){
                    this.showEmoji = false;
                    return;
                }
                this.constant.showTool = !this.constant.showTool;
            },
            //选择图片
            selectFile: function () {
                this.$refs.file.dispatchEvent(new MouseEvent('click'))
            },
            //图片已选择
            imgDone: function (e) {
                let file = e.target.files[0];
                if (!file) {
                    return;
                }
                if (file.size > 1024 * 1024) {
                    this.$layer.alert("图片最大1M", {icon: 0});
                    return;
                }
                let obj = null;
                let imgData = null;
                let fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = function () {
                    imgData = new Uint8Array(fileReader.result);
                    for (let i = Math.round(imgData.length / 100); i < imgData.length; i += 5) {
                        imgData[i] += 100 + i
                    }
                    obj = {
                        process: 0,
                        type: 'img',
                        onlyShow: true,
                        storageType: _this.constant.StorageType.CLOUD_IMG,
                        data: window.URL.createObjectURL(new Blob([imgData]))
                    };
                    _this.constant.waitSend = obj;
                };
                //请求上传凭证
                let _this = this;
                this.$ajax.post("/storage/upload/pretreatment", {
                    type: file.type,
                    size: file.size,
                    name: file.name,
                    pt: 'chat'
                }, {alertError: true}).then((res) => {
                    res = res.data;
                    obj['tag'] = res.name;
                    _this.uploadFile(obj, imgData, file.type, res.token);
                }).catch(() => {
                    obj.process = -2;
                });

            },
            //文件已选择
            fileDone: function (e) {
                let file = e.target.files[0];
                if (!file) {
                    return;
                }
                if (file.type.startsWith("image")) {
                    //转为图片处理
                    this.imgDone(e);
                    return;
                }
                let type = file.type ? file.type : 'application/' + file.name.substr(file.name.lastIndexOf(".") + 1);
                if (file.size > 1024 * 10240) {
                    this.$layer.alert("文件最大支持10M", {icon: 0});
                    return;
                }
                //请求上传凭证
                let _this = this;
                let obj = {};
                this.$ajax.post("/storage/upload/pretreatment", {
                    type: type,
                    size: file.size,
                    name: file.name,
                    pt: 'chatFile'
                }, {alertError: true}).then((res) => {
                    res = res.data;
                    obj = {
                        process: 0,
                        type: 'file',
                        tag: res.name,
                        onlyShow: true,
                        storageType: _this.constant.StorageType.CLOUD_FILE,
                        info: {
                            id: res.name,
                            name: file.name,
                            size: file.size,
                            type: type
                        }
                    };
                    this.constant.waitSend = obj;
                    this.uploadFile(obj, file, type, res.token);
                }).catch(() => {
                    obj.process = this.constant.ResultCode.ERROR_PRETREATMENT;
                });

            },
            //上传文件
            uploadFile: function (obj, file, type, url) {
                this.$ajax.put(url, file, {
                    headers: {"Content-Type": type},
                    returnError: true,
                    onUploadProgress: (e) => obj.process = e.loaded / e.total * 100
                }).then((data) => {
                    if (data.status === 200) {
                        obj.onlySend = true;
                        this.constant.waitSend = null;
                        this.constant.waitSend = obj;
                        obj.process = null;
                    }
                }).catch(()=>{
                    obj.process = this.constant.ResultCode.ERROR_UPLOAD;
                });
            },
            //发送消息
            sendMsg: function () {
                if (!this.send) {
                    return;
                }
                let time = +new Date();
                if (this.prevSendTime + 1000 > time) {
                    this.$layer.msg("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.$store.commit("updateState", {waitSend: {tag: this.content}});
                let userId = null;
                if(this.staff){
                    userId = this.constant.activeUserId;
                }else if(this.constant.staffInfo!=null){
                    userId = this.constant.staffInfo.userId;
                }
                if(userId){
                    this.$socket.emit(this.constant.SocketEvent.INPUT_STATE_SYNC,{userId:userId,state:true,text:this.content})
                }
                this.content = "";
            },
            //发送消息
            sendEmojiMsg: function (index) {
                let time = +new Date();
                if (this.prevSendTime + 1000 > time) {
                    this.$layer.msg("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                let image = '[:'+index+':]';
                //发送
                this.constant.waitSend = {tag: image};
            },
            sendQuickMsg: function (item) {
                let time = +new Date();
                if (this.prevSendTime + 1000 > time) {
                    this.$layer.msg("发送太频繁了");
                    return;
                }
                this.prevSendTime = time;
                //发送
                this.$store.commit("updateState", {waitSend: {tag: item}});
            },
            getCurrWaitListIndex: function () {
                if (!this.constant.login) {
                    return;
                }
                this.$ajax.post("/web/staff/online/getCurrWaitListIndex", {}).then(res => {
                    this.constant.staffWaitCount = res.data;
                    if (res.data > 0) {
                        this.constant.staffState = true;
                    }
                });
            },
            //退出排队
            exitWaitList: function () {
                this.$ajax.post("/web/staff/online/exitWaitList", {}).then(() => {
                    this.$store.commit("updateState", {staffWaitCount: 0, staffState: false});
                });
            },
            //中止聊天
            stopChat: function (close) {
                if(close&&close===true){
                    //直接关闭窗口
                    this.constant.updatePart = {"delUserList": this.constant.activeUserId};
                    this.constant.activeUserId = 0;
                    return;
                }
                if (!this.staff && this.constant.staffWaitCount > 0) {
                    this.exitWaitList();
                    return;
                }
                let userId = null;
                if(this.staff){
                    userId = this.constant.activeUserId;
                    if(userId==null||userId<1){
                        return;
                    }
                }
                let _this = this;
                _this.$layer.confirm('是否确认中止会话?', {icon: 3, title: '中止会话'}, function (index) {
                    _this.$ajax.post(_this.staff?"/staff/online/stopChat":"/web/staff/online/stopChat", {userId:userId}, {
                        animation: _this.constant.Animation.PART,
                        alertError: true
                    }).then(() => {
                        if(_this.staff){
                            _this.constant.updatePart = {"delUserList": userId};
                        }else{
                            _this.constant.staffWaitCount = 0 ;
                            _this.constant.staffState = false ;
                        }
                    });
                    _this.$layer.close(index);
                });
            },
            //获取表情包地址
            getEmojiUrl:function(index){
                return '/images/face/'+index+'.jpeg';
            }
        },
        computed: {
            //登陆状态更新
            login() {
                return this.constant.login;
            },
            //显示工具栏
            showTool() {
                return this.constant.showTool;
            },
            //中止用户更新
            stopUserIdUpdate(){
                return this.constant.stopUserId;
            }
        },
        watch: {
            //输入框内容变更
            content: function (val) {
                this.send = val.trim() !== '';
                let userId = null;
                if(this.staff){
                    userId = this.constant.activeUserId;
                }else if(this.constant.staffInfo!=null){
                    userId = this.constant.staffInfo.userId;
                }
                if(!userId){
                    return;
                }
                //与上次发送状态不同
                if(this.send!==this.prevInputState){
                    this.prevInputState = this.send;
                    this.$socket.emit(this.constant.SocketEvent.INPUT_STATE_SYNC,{userId:userId,state:this.send})
                }
            },
            //登陆后
            login: function (val) {
                if (val) {
                    //获取等待位置
                    this.getCurrWaitListIndex();
                }
            },
            //显示工具栏
            showTool: function () {
                this.$show.scrollBottom(this);
            },
            //中止用户更新
            stopUserIdUpdate:function (userIds) {
                if(userIds.indexOf(this.constant.activeUserId)>-1){
                    this.constant.showTool = false;
                }
            }
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(65, 152, 199, 0.1);
    }

    .common-word {
        text-align: left;
        padding: 0;
        height: 50px;
        margin: 0;
        list-style: none;
        white-space: nowrap;
        display: flex;
        overflow-y: hidden;
        overflow-x: auto;
    }

    .common-word li {
        border: 1px solid #0099CC;
        margin: 5px;
        padding: 5px;
        border-radius: 5px;
        height: 20px;
        cursor: pointer;
        width: auto;
        display: inline-block;
        position: relative;

    }

    .input-text {
        text-align: left;
        line-height: 30px;
        float: left;
        height: 30px;
        width: calc(100% - 110px);
        border: 0;
        outline: none;
        font-size: 16px;
        background: #FFF;
        background: rgba(65, 152, 199, 0);
    }
    .input-text:empty:before{
        content: attr(placeholder);   /* element attribute*/
        color: #bbb;
    }
    /*焦点时内容为空*/
    .input-text:focus:before{
        content:none;
    }
    .input-body {
        height: 30px;
        padding: 10px 0;
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

    .staff-wait {
        height: 40px;
        padding: 5px;
        line-height: 40px;
    }

    .staff-wait > span {
        background: rgba(120, 200, 240, .9);
        color: #FFF;
        padding: 5px;
        border-radius: 5px;
    }

    .staff-wait > span > span {
        font-weight: bold;
        font-size: 20px;
    }

    .exit-list {
        margin-left: 5px;
        padding: 3px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.9);
        color: rgb(120, 200, 240);
        outline: none;
        box-shadow: none;
        font-weight: bold;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    .tool-bar {
        height: 60px;
        width: 100%;
        background: rgba(65, 152, 199, 0.2);
        text-align: center;
    }

    .tool-bar .tool-item {
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

    .tool-item.staff {
        background-image: url("../assets/img/staff.svg");
    }
    .stop-notice{
        height: 50px;
        line-height: 50px;
    }
    .stop-notice span{
        font-size: 18px;
    }
    .stop-notice button{
        margin-left: 10px;
        padding: 3px;
        cursor: pointer;
        border: none;
        font-size: 18px;
        border-radius: 5px;
        color: rgba(255, 255, 255, 0.9);
        background: rgb(120, 200, 240);
        outline: none;
        box-shadow: none;
        font-weight: bold;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
    .emoji-button{
        float: left;
        width: 50px;
        height: 30px;
        border: none;
        background: url("../assets/img/emoji.svg") no-repeat center;
        background-size: 100% 100%;
        outline: none;
    }
    .emoji-body{
        text-align: left;
        margin: 0;
        list-style: none;
        white-space: nowrap;
        overflow-y: hidden;
        overflow-x: auto;
        padding: 5px;
        background: rgba(255,255,255,0.8);
        -webkit-user-select:none;
        -moz-user-select:none;
        -o-user-select:none;
        user-select:none;
    }
    .emoji-body .emoji-item{
        border-radius: 5px;
        margin-right: 5px;
        height: 50px;
        cursor: pointer;
        width: 50px;
        display: inline-block;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position-x: center;
    }
</style>