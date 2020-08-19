import axios from 'axios'
import store from './store';
//基础地址
axios.defaults.baseURL = store.state.serviceUrl;
//超时时间
axios.defaults.timeout = 5000;
console.log(this)
//配置拦截器
axios.interceptors.request.use(config => {
    // 配置token
    let tk = localStorage.getItem("tk");
    if (tk) {
        config.headers['tk'] = tk;
    }
    // 配置content-Type
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    store.commit("updateState",{loading:true});
    return config
}, error => {
    return Promise.reject(error)
});

// 接收
axios.interceptors.response.use(config => {
    if(config.data.code===store.state.ResultCode.NO_AUTH){
        localStorage.removeItem("loginUser");
        store.state.layer.alert("登陆失效",{icon:0});
        return;
    }
    if(config.data.code===store.state.ResultCode.ERROR){
        store.state.layer.alert(config.data.msg,{icon:0});
        return;
    }
    if(config.data.code===store.state.ResultCode.NO_PERMISSION){
        store.state.layer.alert("权限不足",{icon:0});
        return;
    }
    // 关闭loading
    store.commit("updateState",{loading:false});
    return config
}, error => {
    return Promise.reject(error)
});
export default axios;