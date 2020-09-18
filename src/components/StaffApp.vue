<template>
    <div id="app">
        <div class="network-delay" :class="getDelayClass" v-if="this.constant.socketDelay!=null">FPS</div>
        <StaffHeader msg="message header"/>
        <!-- 引用路由 -->
        <router-view></router-view>
        <!--通用footer-->
        <Footer :staff="true"/>
        <Loading/>
    </div>
</template>

<script>
    import StaffHeader from '@/components/StaffHeader.vue'
    import Footer from '@/components/Footer.vue'
    import Loading from '@/components/Loading.vue'

    export default {
        name: 'App',
        data() {
            return {
                constant:this.$store.state,
            }
        },
        components: {
            Loading,
            StaffHeader,
            Footer
        },
        created() {
            this.constant.login = localStorage.getItem("tk")!=null;
        },
        methods: {
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
        },
        computed:{
            //获取延迟
            getDelayClass(){
                if(this.$store.state.socketDelay<0){
                    return 'zero';
                }
                if(this.$store.state.socketDelay<10){
                    return 'five';
                }
                if(this.$store.state.socketDelay<20){
                    return 'four';
                }
                if(this.$store.state.socketDelay<40){
                    return 'three';
                }
                if(this.$store.state.socketDelay<80){
                    return 'two';
                }
                return 'one';
            },
        }
    }
</script>

<style scoped>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        overflow-y: auto;
    }
    .network-delay{
        padding: 2px;
        width: 20px;
        height: 30px;
        border-radius: 5px;
        position: fixed;
        right: 2px;
        top:2px;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position-x: center;;
        background-position-y: top;
        line-height: 50px;
        text-align: center;
        color: #0099CC;
        font-size: 12px;
        z-index: 2;

    }
    .network-delay.five{
        background-image: url("../assets/img/signal5_blue.svg");
    }
    .network-delay.four{
        background-image: url("../assets/img/signal4_blue.svg");
    }
    .network-delay.three{
        background-image: url("../assets/img/signal3_blue.svg");
    }
    .network-delay.two{
        background-image: url("../assets/img/signal2_blue.svg");
    }
    .network-delay.one{
        background-image: url("../assets/img/signal1_blue.svg");
    }
    .network-delay.zero{
        background-image: url("../assets/img/signal0.svg");
    }
</style>
