import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        serviceUrl:"http://127.0.0.1:13010/help/api/",
        loading: true,
        ResultCode: {
            ERROR: 300, // 失败
            NO_AUTH: 400, // 未认证
            NO_PERMISSION: 500 // 权限不足
        }
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