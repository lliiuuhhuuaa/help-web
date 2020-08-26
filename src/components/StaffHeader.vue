<template>
    <div class="head">
        <div class="staff-state">当前服务人数 <span>{{userList.length}}</span> 位 , 排队中人数 <span>{{waitCount}}</span> 位</div>
        <ul id="head-scroll" class="user-item-body">
            <li class="no-user" v-if="userList.length<1&&waitCount<0">当前没有用户需要帮助</li>
            <li class="user-item" v-for="item in userList" v-bind:key="item.userId" @click="constant.activeUserId===item.userId?constant.activeUserId=0:constant.activeUserId=item.userId"  v-bind:class="{'active':constant.activeUserId===item.userId}">{{item.username}}</li>
            <li class="user-item add-user" @click="getWaitUser" v-if="waitCount>0">✚</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'StaffHeader',
        data(){
          return{
            userList:[],
            waitCount:0,
            constant:this.$store.state,
          }
        },

        created() {
            //获取当前排队数
            this.getUserListInfo();
            //获取当前聊天用户
            this.getUserChatListInfo();
        },
      methods:{
          //获取用户排队信息
          getUserListInfo:function(){
              this.getCurrWaitCount();
              if(timer){
                  clearInterval(timer);
              }
              let timer = setInterval(()=>{
                  if(!this.constant.login){
                      clearInterval(timer);
                      return;
                  }
                  this.getCurrWaitCount();
              },6000);

          },
          //获取聊天用户信息
          getUserChatListInfo:function(){
              this.getCurrChatUser();
              if(timer){
                  clearInterval(timer);
              }
              let timer = setInterval(()=>{
                  if(!this.constant.login){
                      clearInterval(timer);
                      return;
                  }
                  this.getCurrChatUser();
              },5000);

          },
          //获取当前排队数
          getCurrWaitCount:function(){
              this.$ajax.post("/staff/online/getCurrWaitCount", {}).then(res => {
                  this.waitCount = res.data==null?0:res.data;
              });
          },
          //获取当前聊天用户
          getCurrChatUser:function(){
              this.$ajax.post("/staff/online/getCurrChatUser", {}).then(res => {
                  this.userList = res.data==null?[]:res.data;
              })
          },
          //获取等待用户
          getWaitUser:function(){
              this.$ajax.post("/staff/online/getWaitUser", {animation:this.constant.Animation.PART,alertError:true}).then(() => {
                  this.getUserChatListInfo();
              })
          },
        //滚动到底部
        scrollBottom: function () {
          let el = document.getElementById("head-scroll");
          el.scrollLeft = el.scrollWidth;
          let count = 10;
          let interval = setInterval(() => {
            el.scrollLeft = el.scrollWidth;
            if (--count < 0) {
              clearInterval(interval);
            }
          }, 10)
        }
      }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .head {
        color: #FFF;
        background: rgba(65, 152, 199, 0.3);
        height: 80px;
        width: 100%;
        position: relative;
    }

    .staff-state {
        height: 30px;
        color: #555;
        padding: 5px;
    }

    .staff-state span {
        color: #0099CC;
        font-weight: bold;
        font-size: 20px;
    }

    .user-item-body {
        height: 40px;
        padding: 0;
        margin: 0;
        list-style: none;
        white-space: nowrap;
        display: flex;
        overflow-y: hidden;
        overflow-x: auto;
    }

    .user-item-body .user-item {
        height: 20px;
        cursor: pointer;
        width: auto;
        color: #EEE;
        background: rgba(65, 152, 199, 0.5);
        padding: 10px;
        border-radius: 10px;
        margin-right: 2px;
        display: inline-block;

    }

    .user-item.active {
        background: rgb(65, 152, 199);
        border-radius: 10px 10px 0 0;
        color: #FFF;
    }

    .user-item.add-user {
        background: #FFF;
        color: #999;
        width: 30px;
    }
    .no-user{
        width: 100%;
        text-align: center;
        color:rgb(65, 152, 199);
    }
</style>
