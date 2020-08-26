import Vue from 'vue'
import App from './App.vue'
import {Emit} from './emit/emit.js'
//合局状态管理
import store from './utils/store';
//通用js
import {encrypt,decrypt} from './utils/common';
//ajax请求
import axios from './utils/http'
//路由
import router from './router'
//弹窗插件
import layer from 'vue-layer'
import 'vue-layer/lib/vue-layer.css';

Vue.config.productionTip = false;
Vue.prototype.Emit = Emit;
Vue.prototype.$store = store;
Vue.prototype.$ajax = axios;
Vue.prototype.$aes = {encrypt,decrypt};
Vue.prototype.$layer = layer(Vue);
Vue.use(layer);
//让http拦截可以使用弹窗
store.commit("updateState", {"layer": Vue.prototype.$layer});
new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
