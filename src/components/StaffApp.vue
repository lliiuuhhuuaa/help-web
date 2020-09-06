<template>
    <div id="app">
        <StaffHeader msg="message header"/>
        <StaffBody ref="mb" msg="message body"></StaffBody>
        <!--通用footer-->
        <Footer :staff="true"/>
        <Loading/>
    </div>
</template>

<script>
    import StaffHeader from '@/components/StaffHeader.vue'
    import StaffBody from '@/components/StaffBody.vue'
    import Footer from '@/components/Footer.vue'
    import Loading from '@/components/Loading.vue'
    export default {
        name: 'App',
        data() {
            return {
                constant:this.$store.state,
            }
        },
        mounted() {
            this.Emit.$on("appToBottom", this.scrollToBottom)
        },
        components: {
            Loading,
            StaffHeader,
            StaffBody,
            Footer
        },
        created() {
            this.constant.login = localStorage.getItem("tk")!=null;
        },
        methods: {
            //弹出键盘时滚动到底部
            scrollToBottom: function () {
                let el = document.getElementById("app");
                this.$nextTick(() => {
                    document.documentElement.scrollTop = el.scrollHeight;
                });
            },//获取地址栏参数
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
