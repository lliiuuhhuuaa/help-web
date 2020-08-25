import Vue from 'vue'
import App from './App.vue'
import {Emit} from './emit/emit.js'
//合局状态管理
import store from './utils/store';
//ajax请求
import axios from './utils/http'
//弹窗插件
import layer from 'vue-layer'
import 'vue-layer/lib/vue-layer.css';
Vue.config.productionTip = false;
Vue.prototype.Emit = Emit;
Vue.prototype.$store = store;
Vue.prototype.$ajax=axios;
Vue.prototype.$layer=layer(Vue);
Vue.use(layer);
//让http拦截可以使用弹窗
store.commit("updateState",{"layer":Vue.prototype.$layer});
new Vue({
  render: h => h(App),
}).$mount('#app');
//自定义post
// Vue.prototype.post = function (url,data,success) {
//   axios.post(url,data,function (res) {
//     if (res.data.code === store.state.ResultCode.ERROR) {
//         throw new Error(res);
//     }else{
//       success(res);
//     }
//   })
// }
Date.prototype.format = function (fmt) {
  let o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
