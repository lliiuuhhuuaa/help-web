import Vue from 'vue'
//路由
import Router from 'vue-router'
import UserApp from '@/components/UserApp'
import StaffApp from '@/components/StaffApp'
import Login from "@/components/Login";
import StaffBody from "../components/StaffBody";
import ChattingRecords from "../components/ChattingRecords";
import OfflineAsk from "../components/OfflineAsk";
import EnterDict from "../components/EnterDict";
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
                    path:"records",
                    component:ChattingRecords
                },
                {
                    path:"offline",
                    component:OfflineAsk
                },{
                    path:"enter_dict",
                    component:EnterDict
                },
                {
                    path:"*",
                    component:StaffBody
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