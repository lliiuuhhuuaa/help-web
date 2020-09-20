<template>
    <div class="body" :style="{height:calcHeight}">
        <div class="user-body">
            <div class="submit-item">
                <div><span class="title">问题标签</span><input style="width: calc(100% - 100px)" v-model="submitObj.tag" @blur="getSplitKeyword"/>
                    <span class="notice">下面输入问题的自动回复</span></div>
            </div>
            <div>
                <div id="editor-tool" ref="editorTool">
                </div>
                <div id="editor" :style="{height:calcEditHeight}" v-html="submitObj.content">
                </div>
            </div>
        </div>
        <div class="submit-body" v-if="submitObj.state">
            <div class="submit-item-body">
                <div class="submit-item">
                    <div><span class="title">问题标签</span><input disabled v-model="submitObj.tag"/>
                        <span class="notice">正在编辑的问题</span></div>
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
                <div class="back-item" style="width:calc(50% - 4px) " @click="updateHelpDict">确认提交</div>
            </div>
        </div>
        <div class="back-list">
            <router-link to="./">
                <div class="back-item" :style="{width:backItemWidth}">返回主页</div>
            </router-link>
            <div class="back-item" :style="{width:backItemWidth}" @click="submitObj.state = true">下一步</div>
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
                //item高度
                itemHeight: 0,
                //富文本
                editor: {},
                //相似提问
                waitAskByLike: [],
                //显示相似选择框
                showWaitAskLike : false,
                submitObj:{tag:'',content:"",state:false,datetime:null,splitKey:[],classify:''}
            }
        },
        created() {
            //获取帮助过的用户
            this.initEditor();
        },
        methods: {
            //初始化编辑器
            initEditor:function(){
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
                    // this.getHelpDictByTag();
                    // //获取词库回复
                    // this.getSplitKeyword();
                })
            },
            //提交
            updateHelpDict: function () {
                if(this.submitObj.tag===''){
                    this.$layer.alert("问题标签不能为空", {icon: 0});
                    return;
                }
                if(this.editor.txt.text()===''){
                    this.$layer.alert("内容不能为空", {icon: 0});
                    return;
                }
                this.submitObj.content = this.editor.txt.html();
                let _this = this;
                this.$layer.confirm("确认提交吗?", {icon: 3, title: '最终确认'}, function (index) {
                    _this.$layer.close(index);
                    _this.$ajax.post("/help/updateHelpDict", {
                        tag:_this.submitObj.tag,
                        content: _this.submitObj.content,
                        expiresDate:_this.submitObj.datetime,
                        classify:_this.submitObj.classify,
                    }, {
                        animation: _this.constant.Animation.PART,
                        alertError: true,
                        headers:{"Content-Type": 'application/json;charset=utf-8'},
                    }).then(() => {
                        _this.$layer.msg("操作成功");
                        _this.submitObj={tag:'',content:"",state:false,datetime:null,splitKey:[],classify:''}
                    });
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
                this.$ajax.post("/help/getHelpDictByTag", {tag: this.submitObj.tag}).then((data) => {
                    if (!data.data) {
                        return;
                    }
                    if(!this.editor.txt.text()){
                        this.editor.txt.html(this.$aes.decrypt(data.data.reply));
                        this.$layer.msg("匹配到在词库中存在相似的问题,已自动填写");
                    }
                });
            },
            //获取词库回复
            getSplitKeyword: function () {
                if(!this.submitObj.tag||this.submitObj.prevTag === this.submitObj.tag){
                    return;
                }
                this.$ajax.post("/help/getSplitKeyword", {text: this.submitObj.tag}).then((data) => {
                    if (!data.data) {
                        return;
                    }
                    this.submitObj.prevTag = this.submitObj.tag;
                    this.submitObj.splitKey = data.data;
                });
            },
        },
        computed: {
            //高度计算
            calcHeight: function () {
                let height = this.constant.windowSize.height - 80;
                return height + 'px';
            },
            //计算编辑器高度
            calcEditHeight: function () {
                let height = this.constant.windowSize.height - 80 - 54;
                height -= this.itemHeight;
                return height + 'px';
            },
            backItemWidth: function () {
                return this.constant.windowSize.width / 2 - 4 + 'px';
            },
            //窗口大小变更
            windowSizeChange() {
                return this.constant.windowSize;
            },
            //对话用户激活变更
            activeUserId() {
                return this.constant.activeUserId;
            },
        },
        watch: {
            //窗口大小变更
            windowSizeChange: function () {
                this.itemHeight = this.$refs.editorTool.offsetHeight;
            },
            activeUserId: function (val) {
                if (val > 0) {
                    this.$router.push("./");
                }
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