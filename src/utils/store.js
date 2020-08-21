import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        serviceUrl:"/help/api",
        loading: true,
        loadingNoBack: false,
        login:false,
        commons:[],
        ResultCode: {
            OK: 200,//成功
            ERROR: 300, // 失败
            NO_AUTH: 400, // 未认证
            NO_PERMISSION: 500 // 权限不足
        },
        MsgState:{
            DANGER:0, // 敏感词拦截
            WAIT:1, // 提交客服等待回复
            RECOMMEND:2, // 推荐问题
            OK:10 // 正常
        },
        StorageType:{
            DB:1, // 数据库
            FILE:2, // 文件
            URL:3, // url
            PC:4, //爬虫1
            PC2:5, //爬虫2
            RECOMMEND:6 //推荐
        },
        //待发送消息
        waitSend:{}
    },
    mutations: {
        updateState(obj,param){
            for (let key in param) {
                this.state[key] = param[key];
            }
        },
        alertSuccess(msg){
            console.log(msg)
        }
    }
});
export default store