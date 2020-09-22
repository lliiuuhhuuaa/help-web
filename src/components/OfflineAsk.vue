<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="user-body">
            <div v-if="waitAsk.length>0 && !activeAsk" class="item-body">
                <div class="mete-item" v-for="item in waitAsk" :key="item.index" @click="activeAsk=item">
                    <div>用户名:{{item.nickname?item.nickname:item.user?item.user:'未知用户名'}}</div>
                    <div class="ellipsis" >联系方式:{{item.contact}}</div>
                    <div class="ellipsis" >问题:{{item.tag}}</div>
                    <span>提问时间:{{new Date(item.createDate).format("yyyy-MM-dd HH:mm:ss")}}</span>
                </div>
            </div>
            <div v-if="activeAsk" style="height: 100%;overflow: auto">
                <div class="mete-item mete-item-once" ref="meteItemOnce">
                    <div>用户名:{{activeAsk.nickname?activeAsk.nickname:activeAsk.user?activeAsk.user:'未知用户名'}}</div>
                    <div class="ellipsis" >联系方式:{{activeAsk.contact}}</div>
                    <div class="multi-line">问题:{{activeAsk.tag}}</div>
                </div>
                <div class="mete-item like-box" v-if="waitAskByLike&&waitAskByLike.length>0" @click="showWaitAskLike=true">
                    <div>匹配相似提问<span>{{waitAskByLike.length}}</span>条</div>
                    <div>已选择同时处理提问<span>{{getSelectedWaitAsk}}</span>条</div>
                </div>
                <div v-if="activeAsk">
                    <div id="editor-tool" ref="editorTool">
                    </div>
                    <div id="editor" v-if="activeAsk" :style="{height:calcEditHeight}" v-html="submitObj.content">
                    </div>
                </div>
            </div>
        </div>
        <div class="like-list-body" v-if="showWaitAskLike && waitAskByLike && waitAskByLike.length>0" @click.self="showWaitAskLike=false">
            <div class="like-item-body">
                <div :class="{'selected':item.selected}" class="mete-item" v-for="item in waitAskByLike" :key="item.index" @click="item.selected = !item.selected">
                    <div>用户名:{{item.nickname?item.nickname:item.user?item.user:'未知用户名'}}</div>
                    <div class="ellipsis" v-html="item.tag.replace('问题','<br/>问题')"></div>
                    <span>提问时间:{{new Date(item.createDate).format("yyyy-MM-dd HH:mm:ss")}}</span>
                </div>
            </div>

            <div class="back-list">
                <div class="back-item" style="width:calc(50% - 4px) " @click="state = waitAskByLike[0].selected,waitAskByLike.forEach((e)=>{e.selected=!state})">全选/全不选</div>
                <div class="back-item" style="width:calc(50% - 4px)" @click="showWaitAskLike=false">返回</div>
            </div>
        </div>
        <div class="submit-body" v-if="submitObj.state">
            <div class="submit-item-body">
                <div class="submit-item">
                    <div><span class="title">处理问题</span><input disabled v-model="activeAsk.tag"/>
                        <span class="notice">正在处理的问题</span></div>
                </div>
                <div class="submit-item">
                    <div><span class="title">处理数量</span><input disabled :value="getSelectedWaitAsk+1+'条'"/>
                        <span class="notice">包含已选择的相似问题和当前编辑问题</span></div>
                </div>
                <div class="submit-item">
                    <div><span class="title">过期时间</span>
                        <date-picker v-model="submitObj.datetime" type="datetime" placeholder="可为空,为空时默认不过期"></date-picker>
                        <span class="notice">超过期限后将不会再用使用此内容自动回复</span>
                    </div>
                </div>
                <div class="submit-item">
                    <div>
                        <span class="title">推荐分类</span><input placeholder="可为空,为空时不会出现在推荐问题中" v-model="submitObj.classify"/>
                        <div class="notice" v-if="submitObj.splitKey && submitObj.splitKey.length>0">可以自定义也可以可选这些关键词:<button @click="submitObj.classify=k" class="btn btn-primary" v-for="k in submitObj.splitKey" :key="k.index">{{k}}</button></div>
                    </div>
                </div>
            </div>
            <div class="back-list">
                <div class="back-item" style="width:calc(50% - 4px)" @click="submitObj.state=false">上一步</div>
                <div class="back-item" style="width:calc(50% - 4px) " @click="updateWaitAsk(true)">确认提交</div>
            </div>
        </div>
        <div class="back-list">
            <router-link to="./">
                <div class="back-item" :style="{width:backItemWidth}" v-if="!activeAsk">返回主页</div>
            </router-link>
            <div class="back-item" :style="{width:backItemWidth}" v-if="activeAsk" @click="activeAsk=null,waitAskByLike=null">返回列表</div>
            <div class="back-item" :style="{width:backItemWidth}" v-if="activeAsk" @click="updateWaitAsk(false)">忽略问题</div>
            <div class="back-item" :style="{width:backItemWidth}" v-if="activeAsk" @click="submitObj.state = true">下一步</div>
        </div>
    </div>

</template>

<script>
    import DatePicker from 'vue2-datepicker';
    import 'vue2-datepicker/index.css';
    import WangEditor from 'wangeditor'
    export default {
        name: 'StaffBody',
        props: {},
        components: {DatePicker},
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
                //item高度
                itemHeight: 0,
                //富文本
                editor: {},
                //相似提问
                waitAskByLike: [],
                //显示相似选择框
                showWaitAskLike : false,
                submitObj:{content:"",state:false,datetime:null,splitKey:[],classify:''}
            }
        },
        created() {
            //获取帮助过的用户
            this.listWaitAsk();
        },
        methods: {
            //提交
            updateWaitAsk: function (state) {
                if (!this.activeAsk) {
                    return;
                }
                if(state){
                    this.submitObj.content = this.editor.txt.html();
                    if(this.submitObj.content===''){
                        this.$dialog.error("内容不能为空");
                        return;
                    }
                }
                let togetherHandle = [];
                for (let i = 0; this.waitAskByLike && i < this.waitAskByLike.length; i++) {
                    if (this.waitAskByLike[i]['selected']) {
                        togetherHandle.push(this.waitAskByLike[i].id);
                    }
                }
                let _this = this;
                this.$dialog.confirm(state?"确认提交吗?":'确认要忽略吗?', {title: '最终确认'}, function (index) {
                    _this.$dialog.close(index);
                    _this.$ajax.post("/wait/ask/updateWaitAsk", {
                        id: _this.activeAsk.id,
                        content: _this.submitObj.content,
                        expiresDate:_this.submitObj.datetime,
                        classify:_this.submitObj.classify,
                        state:state?1:2,
                        togetherHandle:togetherHandle
                    }, {
                        animation: _this.constant.Animation.PART,
                        alertError: true,
                        headers:{"Content-Type": 'application/json;charset=utf-8'},
                    }).then(() => {
                        _this.$dialog.msg("操作成功");
                        _this.activeAsk=null;
                        _this.waitAskByLike=null
                        _this.submitObj={content:"",state:false,datetime:null,splitKey:[],classify:''}
                        _this.listWaitAsk();
                    });
                });
            },
            //获取离线待处理提问
            listWaitAsk: function () {
                this.$ajax.post("/wait/ask/listWaitAsk", {state:0}, {
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
            //获取词库回复
            getHelpDictByTag: function () {
                this.$ajax.post("/help/getHelpDictByTag", {tag: this.activeAsk.tag}).then((data) => {
                    if (!data.data) {
                        return;
                    }
                    if(!this.editor.txt.text()){
                        this.editor.txt.html(this.$aes.decrypt(data.data.reply));
                        this.$dialog.msg("匹配到在词库中存在相似的问题,已自动填写");
                    }
                });
            },
            //获取词库回复
            getSplitKeyword: function () {
                this.$ajax.post("/help/getSplitKeyword", {text: this.activeAsk.tag}).then((data) => {
                    if (!data.data) {
                        return;
                    }
                    this.submitObj.splitKey = data.data;
                });
            },
            //获取词库回复
            listWaitAskByLike: function () {
                this.$ajax.post("/wait/ask/listWaitAskByLike", {id: this.activeAsk.id}).then((data) => {
                    if (!data.data || data.data.length < 1) {
                        return;
                    }
                    data = data.data;
                    for (let dataKey in data) {
                        data[dataKey]['selected'] = false;
                    }
                    this.waitAskByLike = data;
                    this.$dialog.msg("匹配到相似提问,可以选择一同处理");
                });
            },
            //ESC事件
            keyEscEvent:function (e) {
                if(e.code==="Escape"){
                    this.showWaitAskLike = false;
                }
            }
        },
        computed: {
            //高度计算
            calcHeight: function () {
                let height = this.constant.windowSize.height - 85;
                return height + 'px';
            },
            //计算编辑器高度
            calcEditHeight: function () {
                let height = this.constant.windowSize.height - 85 - 54;
                height -= this.itemHeight;
                return height + 'px';
            },
            backItemWidth: function () {
                return this.constant.windowSize.width / (this.activeAsk ? 3 : 1) - 4 + 'px';
            },
            //对话用户激活变更
            activeUserId() {
                return this.constant.activeUserId;
            },
            //窗口大小变更
            windowSizeChange() {
                return this.constant.windowSize;
            },
            //获取已选择数量
            getSelectedWaitAsk() {
                if (!this.waitAskByLike || this.waitAskByLike.length < 1) {
                    return 0;
                }
                let count = 0;
                for (let i = 0; i < this.waitAskByLike.length; i++) {
                    if (this.waitAskByLike[i]['selected']) {
                        count++;
                    }
                }
                return count;
            }
        },
        watch: {
            //窗口大小变更
            windowSizeChange: function () {
                this.itemHeight = this.$refs.editorTool.offsetHeight;
            },
            //激活用户变更
            activeAsk: function (val) {
                if (val) {
                    this.$nextTick(() => {
                        this.editor = new WangEditor('#editor-tool', '#editor');
                        // 使用 base64 保存图片
                        this.editor.customConfig.uploadImgShowBase64 = true;
                        this.editor.customConfig.menus = [
                            'head',  // 标题
                            'bold',  // 粗体
                            'fontSize',  // 字号
                            'fontName',  // 字体
                            'foreColor',  // 文字颜色
                            'backColor',  // 背景颜色
                            'italic',  // 斜体
                            'underline',  // 下划线
                            'strikeThrough',  // 删除线
                            'link',  // 插入链接
                            'list',  // 列表
                            'justify',  // 对齐方式
                            'quote',  // 引用
                            'emoticon',  // 表情
                            'image',  // 插入图片
                            'table',  // 表格
                            'video',  // 插入视频
                            'code',  // 插入代码
                            'undo',  // 撤销
                            'redo'  // 重复
                        ];
                        this.editor.create();
                        this.itemHeight = this.$refs.editorTool.offsetHeight;
                        //匹配现有词库
                        this.getHelpDictByTag();
                        //匹配相似提问
                        this.listWaitAskByLike();
                        //获取词库回复
                        this.getSplitKeyword();
                    })
                }
            },
            activeUserId: function (val) {
                if (val > 0) {
                    this.$router.push("./");
                }
            },
            showWaitAskLike: function (val) {
                if(!val){
                    document.removeEventListener("keyup",this.keyEscEvent);
                    return;
                }
                document.addEventListener("keyup",this.keyEscEvent);
            },
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
        overflow: hidden;
        position: relative;
    }

    .item-body {
        height: 100%;
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
    .mete-item.selected{
        border: 2px solid #0099CC;
        background: #0099CC;
        color: #FFF;
    }
    .mete-item-once {
        width: calc(100% - 44px);
        min-width: auto;
        max-width: none;
    }

    .like-box {
        width: calc(100% - 44px);
        min-width: auto;
        max-width: none;
        margin-top: 0;
    }

    .like-box span {
        font-size: 20px;
        color: #0099CC;
        margin: 0 2px;
    }

    .mete-item-once:hover, .like-box:hover {
        border-color: #FFF;
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

    #editor {
        height: 100%;
    }
    .like-list-body{
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;
        background: rgba(255,255,255,0.9);
    }
    .submit-body{
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;
        background: rgba(255,255,255,0.9);
    }
    .like-item-body{
        width: 100%;
        height: calc(100% - 50px);
        overflow: auto;
    }
    .submit-item {
        background: #FFF;
        color: #000;
        margin: 5px;
        padding: 10px;
        text-align: left;
    }
    .submit-item .title{
        font-weight: bold;
        padding-right: 5px;
    }
    .submit-item .notice{
        padding-left: 10px;
        padding-top: 10px;
        color: #999;
        font-size: 14px;
        display: inline-block;
    }
    .mx-datepicker{
        min-width: 255px;
        height: 30px;
    }
    .submit-item input{
        height: 30px;
        border-radius: 5px;
        border: 1px solid #0099CC;
        min-width: 250px;
    }
</style>
<style>
    #editor {
        overflow: auto;
    }

    .w-e-toolbar {
        /*position: relative;*/
        background: #FFF;
        margin-bottom: 2px;
        display: inline-block;
        height: auto;
        width: 100%;
        text-align: left;
    }

    .w-e-toolbar .w-e-menu {
        display: inline-block;
        /*position: unset;*/
        z-index: auto !important;
    }

    .w-e-toolbar .w-e-droplist {
        /*top:30px;*/
        z-index: 2;
    }

    #editor {
        overflow: auto;
        background: #FFF;
        z-index: auto !important;
    }

    .w-e-text-container .w-e-panel-container {
        margin: 0 auto !important;
        max-width: 100%;
        left: 0;
        right: 0;
    }
</style>