<template>
    <div class="chat-msg" :class="item.class" v-if="item.class===MsgClass.SELF||item.class===MsgClass.REPLY||item.class===MsgClass.SYSTEM">
        <div class="system-msg" v-if="item.class===MsgClass.SYSTEM">{{item.tag}}</div>
        <div v-else>
             <span v-if="item.createDate"
                   class="msg-time">{{new Date(item.createDate).format('yyyy-MM-dd HH:mm:ss')}} </span>
            <div class="html-div" v-if="item.type==='html'" v-html="item.tag"></div>
            <div class="img-div" v-else-if="item.storageType === constant.StorageType.CLOUD_IMG">
                <UploadProcess :item="item"/>
                <img src="@/assets/img/img.svg" @click="zoomImg" v-on:load.once="loadImg($event,item)"/>
            </div>
            <div class="file-div point" v-else-if="item.storageType === constant.StorageType.CLOUD_FILE" @click="download(item)">
                <UploadProcess :item="item"/>
                <div class="file-img"/>
                <div class="ellipsis file-name">{{item.info.name}}</div>
                <div class="file-size">
                    {{item.info.size>=102400?((item.info.size/1024/1024).toFixed(2)+"Mb"):((item.info.size/1024).toFixed(2)+"Kb")}}
                </div>
                <div class="file-notice" v-if="item.class!==MsgClass.SELF">注意:接收来历不明文件可能会导致设备中病毒</div>
            </div>
            <div class="html-div" v-else-if="item.type==='ask_answer'">
                {{item.tag[0]}}
                <button class="get-answer" @click="$event.currentTarget.innerText=item.tag[1]">查看答案</button>
            </div>
            <div v-else>{{item.tag}}</div>
        </div>
    </div>

</template>

<script>
    import UploadProcess from "@/components/UploadProcess";
    //重命名文件插件
    import saveAs from 'file-saver';
    export default {
        name: 'ChatMsg',
        props: {
            item: Object
        },
        components: {
            UploadProcess,
        },
        data() {
            return {
                MsgClass: {
                    SELF: "self-msg",
                    REPLY: "reply-msg",
                    SYSTEM:"system-msg"
                },
                constant: this.$store.state,
            }
        },
        created() {
            let _this = this;
            window.SD = function (tag) {
                _this.constant.waitSend = {tag: tag};
            };
        },
        methods: {
            zoomImg: function (e) {
                this.constant.zoomImgSrc = e.target.src;
            },
            //加载图片
            loadImg: function (e, item) {
                item.process=0;
                let img = e.target;
                if (img.getAttribute("data-load")) {
                    return;
                }
                img.setAttribute("data-load", 1);
                let xhr = new XMLHttpRequest();
                let src = item.data;
                if (!src) {
                    src = item.tag;
                    if (item.storageType === this.constant.StorageType.CLOUD_IMG) {
                        //是云存储图片
                        src = this.$config.get("storage_domain") + src;
                    }
                }
                let _this = this;
                xhr.open('GET', src, true);//get请求，请求地址，是否异步
                xhr.responseType = "arraybuffer";
                xhr.addEventListener('progress',function (evt) {
                    if (evt.lengthComputable) {
                        item.process=evt.loaded / evt.total*100;
                    }
                },false);
                xhr.onload = function () {
                    if (this.status === 200) {
                        let imgData = new Uint8Array(this.response);
                        for (let i = Math.round(imgData.length / 100); i < imgData.length; i += 5) {
                            imgData[i] -= 100 + i
                        }
                        _this.$show.scrollBottom(_this);
                        img.src = window.URL.createObjectURL(new Blob([imgData]));
                        item.process = null;
                    }
                };
                xhr.onerror = function(){
                    item.process = -1;
                };
                xhr.send();
            },
            //下载文件
            download:function (item) {
                item.process=0;
                const xhr = new XMLHttpRequest();
                xhr.open('get', this.$config.get("storage_domain")+item.tag, true);
                xhr.responseType = 'blob';
                xhr.addEventListener('progress',function (evt) {
                    if (evt.lengthComputable) {
                        item.process=evt.loaded / evt.total*100;
                    }
                },false);
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        //重命名文件
                        saveAs(xhr.response, item.info.name);
                        item.process = null;
                    }
                };
                xhr.send();

            }
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .chat-msg {
        border-radius: 18px 18px 18px 18px;
        font-size: 16px;
        padding: 16px;
        background: #FFF;
        text-align: left;
    }

    .chat-msg.self-msg {
        text-align: right;
        margin-left: 50px;
    }

    .chat-msg.self-msg > div {
        color: #FFF;
        background: #5CC9F5;
        text-align: left;
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 0 18px;
    }

    .chat-msg.reply-msg{
        text-align: left;
    }

    .reply-msg > div, .evaluate-msg > div {
        word-break: break-all;
        word-wrap: break-word;
        border-radius: 18px 18px 18px 0;
    }

    .html-div {
        overflow: auto;
    }

    .msg-time {
        font-size: 14px;
        position: absolute;
        top: -5px;
        color: #999;
    }

    .file-div {
        text-align: center;
    }

    .chat-msg.reply-msg .msg-time {
        left: 20px;
    }

    .file-div .file-img {
        height: 40px;
        background-size: 40px 40px;
        background-repeat: no-repeat;
        background-position-x: center;
    }

    .chat-msg.self-msg .msg-time {
        right: 20px;
    }

    .file-div .file-name {
        font-size: 20px;
        font-weight: bold;
    }

    .file-notice {
        font-size: 12px;
        text-decoration: underline
    }

    .chat-msg.reply-msg .file-img {
        background-image: url("../assets/img/down_black.svg");
    }

    .chat-msg.self-msg .file-img {
        background-image: url("../assets/img/down_white.svg");
    }
    .html-div {
        overflow: auto;
    }
    .img-div img {
        max-width: 100%;
        min-width: 30px;
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
