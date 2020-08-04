<template>
  <div class="head">
    <img class="logo" alt="log" src="../assets/help_robot.png">
  </div>
</template>

<script>
export default {
  name: 'MessageHeader',
  props: {
    msg: String
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
