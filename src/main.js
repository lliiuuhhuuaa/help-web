import Vue from 'vue'
import App from './App.vue'
import {Emit} from './emit/emit.js'
//通用js
import common from './utils/common';
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
//数据库
import indexdb from "./utils/indexdb";
Vue.use(common);
Vue.config.productionTip = false;
Vue.prototype.Emit = Emit;
Vue.prototype.$store = store;
Vue.prototype.$ajax = axios;
Vue.prototype.$layer = layer(Vue);
Vue.prototype.$indexdb = indexdb;
//开启并初始化数据库
indexdb.openDB("help_db",'1.0',[{name:"help_msg",key:"id",indexs:[{key:"userId",unique:false}]}],function (db) {
    Vue.prototype.$db = db;
});
Vue.use(new VueSocketIO({
    debug: false,
    connection: SocketIO("/", {autoConnect: false}),
}));
//连接socket
Vue.prototype.$connect = function (state) {
    socket(this,state);
};
Vue.use(layer);
//让http拦截可以使用弹窗
store.commit("updateState", {"layer": Vue.prototype.$layer});
new Vue({
    router,
    render: h => h(App),
}).$mount('#app');


