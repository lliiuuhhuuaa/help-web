<template>
    <div id="app">
        <ZoomImg/>
        <router-view></router-view>
    </div>
</template>

<script>
    import ZoomImg from "@/components/ZoomImg";
    export default {
        name: 'App',
        components: {
            ZoomImg,
        },
        created() {
            let _this = this;
            window.onresize = function () {
                _this.$store.state.windowHeight = window.innerHeight;
            }
        },
        computed: {
            //登陆状态更新
            login() {
                return this.$store.state.login;
            },
        },
        watch: {
            login: function (val) {
                this.$connect(val);
                if(val){
                    //获取用户信息
                    this.getUserInfo();
                    //获取系统配置
                    this.getSystemConfig();
                }
            },
        },
        methods:{
            //获取用户信息
            getUserInfo:function () {
                this.$ajax.post("/user/getUserInfo", {animation:this.$store.state.Animation.PART,alertError:true}).then((res) => {
                    this.$store.state.userInfo = res.data;
                })
            },
            //获取系统配置
            getSystemConfig:function () {
                this.$ajax.post("/config/listConfigByWeb",{},{returnError:true}).then((res) => {
                    if(res.code===this.$store.state.ResultCode.OK){
                        res = res.data;
                        for(let i=0;i<res.length;i++){
                            this.$config.set(res[i].configKey,res[i].configValue);
                        }
                    }
                })
            }
        }
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        overflow-y: auto;
    }
    .text-center{
        text-align: center;
    }
    /*隐藏*/
    .hide{
        display: none;
    }
    .point{
        cursor: pointer;
    }
    /*省略号*/
    .ellipsis{
        overflow:hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow:ellipsis;
    }
    /*超出自动换行*/
    .multi-line{
        word-break: break-all;
        word-wrap: break-word;
        white-space: pre-wrap;
    }
</style>