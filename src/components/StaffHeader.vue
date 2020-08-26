<template>
    <div class="head">
        <div class="staff-state">当前服务人数 <span>{{userList.length}}</span> 位 , 排队中人数 <span>{{waitCount}}</span> 位</div>
        <ul id="refresh-scroll" class="user-item-body">
            <li class="user-item" v-for="item in userList" v-bind:key="item.id" @click="activeId=item.id"  v-bind:class="{'active':activeId===item.id}">{{item.username}}</li>
            <li class="user-item add-user" @click="addUser" v-if="waitCount>0">✚</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'MessageHeader',
        data(){
          return{
            activeId:0,
            userList:[{id:1,username:"1号用户11"},{id:2,username:"2号用户2"},{id:3,username:"3号用户444"},{id:4,username:"4号用户43534"},{id:5,username:"5号用户9781"}],
            waitCount:2,
          }
        },
      methods:{
          addUser:function () {
            this.waitCount--;
            let data = {
              id: +new Date(),
              username: 'x号用户'
            };
            this.activeId = data.id;
            this.userList.push(data);
            this.scrollBottom();
          },
        //滚动到底部
        scrollBottom: function () {
          let el = document.getElementById("refresh-scroll");
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
        height: auto;
        width: 100%;
        padding: 5px 0;
        position: relative;
    }

    .staff-state {
        color: #555;
        padding: 5px;
    }

    .staff-state span {
        color: #0099CC;
        font-weight: bold;
        font-size: 20px;
    }

    .user-item-body {
        height: 100%;
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
    }
</style>
