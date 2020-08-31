<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'App',
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
                    this.getUserInfo();
                }
            },
        },
        methods:{
            getUserInfo:function () {
                this.$ajax.post("/user/getUserInfo", {animation:this.$store.state.Animation.PART,alertError:true}).then((res) => {
                    this.$store.state.userInfo = res.data;
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
</style>
