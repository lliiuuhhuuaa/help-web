import Vue from 'vue'
//路由
import Router from 'vue-router'
import UserApp from '@/components/UserApp'
import StaffApp from '@/components/StaffApp'
import Login from "@/components/Login";
//弹窗插件
Vue.use(Router);
//路由
export default new Router({
    routes: [
        {
            path: "/",
            name: "UserApp",
            component: UserApp
        },
        {
            path: "/staff",
            name: "StaffApp",
            component: StaffApp
        },
        {
            path: "/login",
            name: "login",
            component: Login
        }
    ]
})