<template>
  <div class="footer">
      <ul class="common-word">
          <li v-for="item in words" :key="item">
              {{item}}
          </li>
      </ul>
      <div class="input-body">
         <input class="input-text" name="text"/>
         <button class="send-button"></button>

      </div>
  </div>
</template>

<script>
export default {
  name: 'MessageFooter',
  data(){
      return {
          words: ["怎么用?","是吗","怎么退出"]
      }
  },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .common-word{
        text-align: left;
        padding:0;
    }
    .common-word li{
        display: inline;
        border: 1px solid #0099CC;
        list-style: none;
        margin:5px;
        padding:5px;
        border-radius: 5px;
    }
    .input-text{
        border: none;
    }
    .send-button{
        width:50px;
        height: 30px;
        border: none;
        background: url("../assets/send.png") repeat;
    }
</style>