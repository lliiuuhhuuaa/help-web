<template>
  <div id="app">
    <MessageHeader msg="message header"/>
    <MessageBody msg="message body"/>
    <MessageFooter msg="message footer"/>
  </div>
</template>

<script>
import MessageHeader from './components/MessageHeader.vue'
import MessageBody from './components/MessageBody.vue'
import MessageFooter from './components/MessageFooter.vue'

export default {
  name: 'App',
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
