import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        serviceUrl:"/help/api",
        loading: false,
        loadingNoBack: false,
        login:false,
        commons:[],
        ResultCode: {
            OK: 200,//成功
            ERROR: 300, // 失败
            NO_AUTH: 400, // 未认证
            NO_PERMISSION: 500, // 权限不足
            ERROR_UPLOAD: -21, // 文件上传失败
            ERROR_PRETREATMENT: -22, // 文件预上传失败
            ERROR_DOWNLOAD: -3, // 文件下载失败
            ERROR_SEND: -23, // 文件发送失败
        },
        MsgState:{
            DANGER:0, // 敏感词拦截
            WAIT:1, // 提交客服等待回复
            RECOMMEND:2, // 推荐问题
            OK:10, // 正常
            STAFF:4, // 人工
        },
        StorageType:{
            DB:1, // 数据库
            FILE:2, // 文件
            URL:3, // url
            PC:4, //爬虫1
            PC2:5, //爬虫2
            RECOMMEND:6, //推荐
            HTML:7, //html
            CLOUD_IMG:8, //云图片
            CLOUD_FILE:9, //云文件
        },
        StaffType:{
            WAIT:1, // 等待
            SEND:2 //已发送
        },
        Animation:{
            ALL:1,
            PART:2
        },
        //待发送消息
        waitSend:{},
        //等待人数
        staffWaitCount: 0,
        //人工客服状态
        staffState:false,
        //激活用户ID
        activeUserId:-1,
        //中止用户
        stopUserId:[],
        //当前用户信息
        userInfo:null,
        //显示工具栏
        showTool:false,
        //更新局部
        updatePart:null,
        //显示foot
        showFooter:false,
        //放大图片
        zoomImgSrc:null,
        //系统配置
        systemConfig:{},
        //显示滚动到底部
        showScrollBottom:false,
        //最后滚动条位置
        lastScrollHeight: 0,
        //系统消息
        systemMsg:null,
        //客服信息
        staffInfo: null,

    },
    mutations: {
        updateState(obj,param){
            for (let key in param) {
                this.state[key] = param[key];
            }
        },
        alertSuccess(msg){
            console.log(msg)
        },
        //监听数据更新
        listenUpdateData:function (obj,_this) {
            _this.sockets.subscribe("dataUpdate", data => {
                for(let i=0;i<data.length;i++){
                    let temp = data[i];
                    if(temp.key.indexOf("constant.")>-1){
                        temp.key = temp.key.replace("constant.","");
                        _this.constant[temp.key] = temp.obj?temp.obj:null;
                        continue;
                    }
                    if(_this[temp.key]!==undefined){
                        _this[temp.key] = temp.obj?temp.obj:null;
                    }
                }
                console.log("接收到数据更新1",data);
            });
        }
    }
});
export default store