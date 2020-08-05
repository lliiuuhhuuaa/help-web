<template>
  <div class="head" v-if="!hideHeader">
    <img class="logo" alt="log" src="../assets/help_robot.png">
  </div>
</template>

<script>
export default {
  name: 'MessageHeader',
  props: {
    hideHeader: Boolean
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.head{
  background: #0099CC;
  color: #FFF;
  height: 50px;
}
  .logo{
    margin: 2px;
  }
</style>
