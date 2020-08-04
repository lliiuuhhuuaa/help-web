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
  components: {
    MessageBody:MessageBody,
    MessageHeader:MessageHeader,
    MessageFooter:MessageFooter
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
}
</style>
