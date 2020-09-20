import axios from 'axios'
import store from './store';
import qs from 'qs'
//基础地址
axios.defaults.baseURL = store.state.serviceUrl;
//超时时间
axios.defaults.timeout = 10000;
//配置拦截器
/***
 * //显示加载动画种类
 * config.animation=this.constant.Animation.ALL/PART
 * //出现错误时是否弹出错误并中止
 * config.alertError=true/false
 * //出现错误时是否直接返回错误
 * config.returnError=true/false
 * //出现错误时是否忽略
 * config.ignoreError=true/false
 * //忽略拦截处理
 * config.ignoreHandle=true
 */
axios.interceptors.request.use(config => {
    if(config.ignoreHandle){
        return config;
    }
    if(!config.url.startsWith("http")){
        // 配置token
        let tk = localStorage.getItem("tk");
        if (tk) {
            config.headers['tk'] = tk;
        }
    }
    let contentType = config.headers['Content-Type'];
    if (!contentType||contentType.indexOf("application/x-www-form-urlencoded")>-1) {
        // 配置content-Type
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.data = qs.stringify(config.data);
    }
    if(config.animation===store.state.Animation.ALL){
        store.commit("updateState", {loading: true});
    }else if(config.animation===store.state.Animation.PART){
        store.commit("updateState", {loadingNoBack: true});
    }
    return config
}, error => {
    if(error.response.config.animation===store.state.Animation.ALL){
        store.commit("updateState", {loading: false});
    }else if(error.response.config.animation===store.state.Animation.PART){
        store.commit("updateState", {loadingNoBack: false});
    }
    // 关闭loading
   // store.commit("updateState", {loading: false});
    store.state.layer.msg("网络繁忙,请稍候重试");
    return new Promise(() => {console.log(error)});
});

// 接收
axios.interceptors.response.use(response => {
    if(response.config.animation===store.state.Animation.ALL){
        store.commit("updateState", {loading: false});
    }else if(response.config.animation===store.state.Animation.PART){
        store.commit("updateState", {loadingNoBack: false});
    }
    if(response.config.ignoreHandle){
        return response;
    }
    if(response.config.url.startsWith("http")){
        return response;
    }
    if (response.data.code != store.state.ResultCode.OK) {
        //忽略错误
        if(response.config.ignoreError){
            return new Promise(() => {});
        }
    }
    if (response.data.code === store.state.ResultCode.NO_AUTH) {
        localStorage.removeItem("loginUser");
        store.state.layer.alert("登陆失效", {icon: 0});
        store.commit("updateState", {login: true});
        //中止执行
        return new Promise(() => {});
    }
    if (response.data.code === store.state.ResultCode.ERROR) {
        //直接弹出错误,中止后续处理
        if(response.config.alertError){
            store.state.layer.alert(response.data.msg, {icon: 0});
            return new Promise(() => {});
        }
        //直接返回错误
        if(response.config.returnError){
            return response;
        }
       // store.state.layer.alert(response.data.msg, {icon: 0});
        //中止执行
        throw new Error(response.data.msg);
      //  return new Promise(response.data);
    }
    if (response.data.code === store.state.ResultCode.NO_PERMISSION) {
        store.state.layer.alert("权限不足", {icon: 0});
        //中止执行
        throw new Error("权限不足");
    }

    // 关闭loading
    //store.commit("updateState", {loading: false});
    return response.data;
}, error => {
    if(error.config.animation===store.state.Animation.ALL){
        store.commit("updateState", {loading: false});
    }else if(error.config.animation===store.state.Animation.PART){
        store.commit("updateState", {loadingNoBack: false});
    }
    //忽略错误
    if(error.config.ignoreError){
        return new Promise(() => {});
    }
    // 关闭loading
    //store.commit("updateState", {loading: false});
    let resp = error.response;
    let code = resp ? resp.status : null;
    if (code === 500) {
        store.state.layer.msg("系统繁忙,请稍候重试");
        throw new Error("系统繁忙,请稍候重试");
    } else if (code === 502) {
        store.state.layer.msg("网络繁忙,请稍候重试");
        throw new Error("系网络繁忙,请稍候重试");
    } else if (code === 404) {
        store.state.layer.msg("系统被外星人带走了,正在抢救");
        throw new Error("系统被外星人带走了,正在抢救");
    } else {
        store.state.layer.msg("系统繁忙,请稍候重试");
        throw new Error("系统繁忙,请稍候重试");
    }

});
export default axios;