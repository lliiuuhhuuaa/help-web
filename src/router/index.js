import Vue from 'vue'
//路由
import Router from 'vue-router'
import UserApp from '@/components/UserApp'
import StaffApp from '@/components/StaffApp'
import Login from "@/components/Login";
import StaffBody from "../components/StaffBody";
import ChattingRecords from "../components/ChattingRecords";
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
            component: StaffApp,
            //配置多级路由，在children数组里添加子路由信息
            children:[
                {
                    path:"/",
                    component:StaffBody
                },
                {
                    path:"/records",
                    component:ChattingRecords
                },
            ]
        },
        {
            path: "/login",
            name: "login",
            component: Login
        },
    ],
    // mode:'history'
})