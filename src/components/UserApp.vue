<template>
    <div id="app">
        <UserHeader msg="message header" :hide-header="hideHeader"/>
        <UserBody ref="mb" msg="message body" :hide-header="hideHeader"></UserBody>
        <!--通用footer-->
        <Footer :staff="false"/>
        <Loading/>
    </div>
</template>

<script>
    import UserHeader from '@/components/UserHeader.vue'
    import UserBody from '@/components/UserBody.vue'
    import Footer from '@/components/Footer.vue'
    import Loading from '@/components/Loading.vue'

    export default {
        name: 'App',
        data() {
            return {
                hideHeader: this.getUrlParam("hideHeader") == "1",
                constant:this.$store.state
            }
        },
        created() {
            this.constant.showFooter = true;
            //登陆认证
            this.loginConnect();
        },
        components: {
            Loading,
            UserBody,
            UserHeader,
            Footer
        },
        methods: {
            //登陆
            loginConnect:function(){
                this.$ajax.post("/open/user/connect", {cert: this.getUrlParam("cert")},{animation:this.constant.Animation.ALL,alertError:true}).then(res => {
                    localStorage.setItem("tk",res.data);
                    this.$store.commit("updateState",{login:true});
                })
            },
            //获取地址栏参数
            getUrlParam: function (name) {
                // 获取参数
                var url = window.location.search;
                // 正则筛选地址栏
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                // 匹配目标参数
                var result = url.substr(1).match(reg);
                if (!result) {
                    return null;
                }
                var param = decodeURIComponent(result[2]);
                if (param == 'null' || param == 'undefined') {
                    return null;
                }
                //返回参数值
                return param;
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
</style>
