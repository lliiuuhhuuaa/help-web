import axios from 'axios'
import store from './store';
//基础地址
axios.defaults.baseURL = store.state.serviceUrl;
//超时时间
axios.defaults.timeout = 5000;
//配置拦截器
axios.interceptors.request.use(config => {
    // 配置token
    let tk = localStorage.getItem("tk");
    if (tk) {
        config.headers['tk'] = tk;
    }
    if(config.headers['Content-Type']==null){
        // 配置content-Type
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        let ret = "";
        let data = config.data;
        for (let dataKey in data) {
            if(ret!==""){
                ret = "&";
            }
            ret += dataKey + "=" + data[dataKey];
        }
        config.data = ret;
    }
    store.commit("updateState",{loading:true});
    return config
}, error => {
    store.state.layer.msg("网络繁忙,请稍候重试",{time:10000});
    return Promise.reject(error)
});

// 接收
axios.interceptors.response.use(response => {
    if(response.data.code===store.state.ResultCode.NO_AUTH){
        localStorage.removeItem("loginUser");
        store.state.layer.alert("登陆失效",{icon:0});
        store.commit("updateState",{login:true});
        //中止执行
        return new Promise(()=>{});
    }
    if(response.data.code===store.state.ResultCode.ERROR){
        store.state.layer.alert(response.data.msg,{icon:0});
        //中止执行
        return new Promise(()=>{});
    }
    if(response.data.code===store.state.ResultCode.NO_PERMISSION){
        store.state.layer.alert("权限不足",{icon:0});
        //中止执行
        return new Promise(()=>{});
    }
    // 关闭loading
    store.commit("updateState",{loading:false});
    return response.data;
}, error => {
    let resp = error.response;
    let code = resp?resp.status:null;
    if(code===500){
        store.state.layer.msg("系统繁忙,请稍候重试",{time:60000});
    }else if(code===502){
        store.state.layer.msg("网络繁忙,请稍候重试",{time:60000});
    }else if(code===404){
        store.state.layer.msg("系统被外星人带走了,正在抢救",{time:60000});
    }else{
        store.state.layer.msg("系统繁忙,请稍候重试",{time:60000});
    }
    return Promise.reject(error)
});
export default axios;