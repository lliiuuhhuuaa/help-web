<template>
  <div id="app">
    <MessageHeader msg="message header" :hideHeader="hideHeader"/>
    <MessageBody msg="message body" :hideHeader="hideHeader"/>
    <MessageFooter msg="message footer"/>
  </div>
</template>

<script>
import MessageHeader from './components/MessageHeader.vue'
import MessageBody from './components/MessageBody.vue'
import MessageFooter from './components/MessageFooter.vue'

export default {
  name: 'App',
  data(){
    return{
      hideHeader: this.getUrlParam("hideHeader")=="1"
    }

  },
  mounted() {
    this.Emit.$on("appToBottom",this.scrollToBottom)
  },
  components: {
    MessageBody:MessageBody,
    MessageHeader:MessageHeader,
    MessageFooter:MessageFooter
  },
  methods:{
    //弹出键盘时滚动到底部
    scrollToBottom:function () {
      let el = document.getElementById("app");
      this.$nextTick(() => {
        document.documentElement.scrollTop = el.scrollHeight;
      });
    },//获取地址栏参数
    getUrlParam:function(name){
      // 获取参数
      var url = window.location.search;
      // 正则筛选地址栏
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      // 匹配目标参数
      var result = url.substr(1).match(reg);
      if(!result){
        return null;
      }
      var param = decodeURIComponent(result[2]);
      if(param=='null'||param=='undefined'){
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
