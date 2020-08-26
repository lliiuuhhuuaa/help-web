<template>
    <div id="app">
        <div class="login-body">
            <p class="title">客服系统登陆中心</p>
            <form autocomplete="off">
                <div class="input-group">
                    <input type="text" placeholder="用户名/手机号" name="username" v-model="username">
                </div>
                <div class="input-group">
                    <input type="password" name="password" placeholder="请输入密码" v-model="password">
                </div>
                <div class="input-group pull-left">
                    <label><input type="checkbox" class="input-checkbox" v-model="save"><i>✓</i>记住账号密码</label>
                </div>
                <div class="input-group">
                    <button @click="login()" type="button">登录</button>
                </div>
            </form>
        </div>
        <Loading/>
    </div>
</template>

<script>
    import Loading from "@/components/Loading";
    import "@/assets/css/loading.css";

    export default {
        name: 'App',
        components: {Loading},
        data() {
            return {
                constant: this.$store.state,
                username: "",
                password: "",
                save: false,
            }
        },
        commands: {
            Loading
        },
        created() {
            let loginSave = localStorage.getItem("login-save-state");
            if(loginSave){
                this.save = true;
                loginSave = localStorage.getItem("login-save");
                if(loginSave){
                    loginSave = loginSave.split(",");
                    this.username = this.$aes.decrypt(loginSave[0]);
                    this.password = this.$aes.decrypt(loginSave[1]);
                }
            }
        },
        methods: {
            //登陆
            loginConnect: function () {

            },
            login:function(){
                if(this.username===''||this.password===''){
                    this.$layer.msg("请输入账号和密码");
                    return;
                }
                if(this.save){
                    localStorage.setItem("login-save-state","1");
                    localStorage.setItem("login-save",this.$aes.encrypt(this.username)+","+this.$aes.encrypt(this.password));
                }else{
                    localStorage.removeItem("login-save-state");
                    localStorage.removeItem("login-save");
                }
                this.$ajax.post("/user/login", {username:this.username,password:this.$aes.encrypt(this.password)},{animation:this.constant.Animation.PART,alertError:true}).then(res => {
                    console.log(res);
                })
            }
        }
    }
</script>

<style scoped>
    #app {
        text-align: center;
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        height: 100vh;
        width: 100vw;
        color: #FFF;
        background-image: linear-gradient(-20deg, #98CDD5,#56BED5);
    }

    .login-body {
        padding:20px;
        max-width: 550px;
        margin:10% auto;;
    }

    .title {
        margin:50px 0;
        font-size: 30px;
        color: transparent;
        background-color: #FFF;
        text-shadow: rgba(255, 255, 255, 0.5) 0 5px 6px, rgba(255, 255, 255, 0.2) 1px 3px 3px;
        -webkit-background-clip: text;
    }

    .input-group {
        margin: 30px 20px;
        width: auto;
    }
    .input-group.pull-left{
        text-align: left;
    }
    input {
        width: 100%;
        border: 0;
        padding-left: 5px;
        font-size: 16px;
        color: #FFF;
        height: 30px;
        background: none;
        font-weight: bold;
        outline: none;
        border-bottom:2px solid #FFF;
    }
    label i{
        font-size: 12px;
        font-style: normal;
        display: inline-block;
        width: 13px;
        height: 13px;
        text-indent:2px;
        line-height: 15px;
        margin: 0 5px 0 0;
        border: #dcdfe6 1px solid;
        color: rgba(255,255,255,0);
    }
    input::-webkit-input-placeholder{
        color: #EEE;
        font-size: 14px;
    }
    input[type="checkbox"]{
        display: none;
    }
    input[type="checkbox"]+i{
        border-radius: 3px;
    }
    input[type="checkbox"]:checked+i{
        background: #FFF;
        border:1px solid #FFF;
        color: #56BED5;
    }
    input[type="checkbox"]:checked~b{
        color:#FFF;
    }
    button {
        width: 100%;
        cursor: pointer;
        border-radius: 5px;
        border: 2px solid #FFF;
        height: 40px;
        background: none;
        color: #FFF;
        font-size: 18px;
        outline-color: #FFF;
    }


</style>
