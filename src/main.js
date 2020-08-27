import Vue from 'vue'
import App from './App.vue'
import {Emit} from './emit/emit.js'
//通用js
import {encrypt, decrypt, webSql} from './utils/common';
import axios from './utils/http';
import store from './utils/store';
//socket
import VueSocketIO from 'vue-socket.io';
import SocketIO from "socket.io-client";
import socket from './utils/socket.js';
//路由
import router from './router'
//弹窗插件
import layer from 'vue-layer'
import 'vue-layer/lib/vue-layer.css';

Vue.config.productionTip = false;
Vue.prototype.Emit = Emit;
Vue.prototype.$store = store;
Vue.prototype.$ajax = axios;
Vue.prototype.$aes = {encrypt, decrypt};
Vue.prototype.$layer = layer(Vue);
Vue.use(new VueSocketIO({
    debug: false,
    connection: SocketIO("/", {autoConnect: false}),
}));
//连接socket
Vue.prototype.$connect = function (state) {
    socket(this,state);
};
Vue.use(layer);
Vue.use(webSql);
//让http拦截可以使用弹窗
store.commit("updateState", {"layer": Vue.prototype.$layer});
new Vue({
    router,
    render: h => h(App),
}).$mount('#app');


