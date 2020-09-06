<template>
    <div class="circle_process" v-if="item!=null&&item.process!=null" @click="errorHandle(item)">
        <div class="wrapper right">
            <div class="circle rightcircle" :style="{transform:item.process<=50?'rotate('+ (-135+item.process*3.6) +'deg)':'rotate(45deg)'}"></div>
        </div>
        <div class="wrapper left">
            <div class="circle leftcircle" :style="{transform:item.process<=50?'rotate(-135deg)':'rotate('+ (-135+(item.process-50)*3.6) +'deg)'}"></div>
        </div>
        <div :style="{color:item.process<0?'#FF7867':'#000'}" class="process-inner">{{item.process>0?Math.floor(item.process)+'%':item.process===0?'准备中':'失败'}}</div>
    </div>
</template>
<script>
    export default {
        props: {
            //此处接收一个对象,如果是单纯的数字,会导致动画同级元素刷新,原因不知
            item: {
                type : Object, default: null
            },
        },
        methods:{
            errorHandle:function(item) {
                if(item.process==null||item.process>=0){
                    return;
                }
                console.log(item.process);
            }
        }
    }
</script>
<style scoped>
    .circle_process {
        position: absolute;
        right: 15px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        text-align: center;
        line-height: 50px;
        bottom: 15px;
        background: rgba(255,255,255,0.5);
    }
    .circle_process .wrapper{
        width: 25px;
        height: 50px;
        position: absolute;
        top:0;
        overflow: hidden;
    }
    .circle_process .right{
        right:0;
    }
    .circle_process .left{
        left:0;
    }
    .circle_process .circle{
        width: 42px;
        height: 42px;
        border:4px solid transparent;
        border-radius: 50%;
        position: absolute;
        top:0;
        transform : rotate(-135deg);
    }
    .circle_process .rightcircle{
        border-top:4px solid #0099CC;
        border-right:4px solid #0099CC;
        right:0;
        -webkit-animation: circle_right 5s linear infinite;
    }
    .circle_process .leftcircle{
        border-bottom:4px solid #0099CC;
        border-left:4px solid #0099CC;
        left:0;
        -webkit-animation: circle_left 5s linear infinite;
    }
    .process-inner {
        width: 50px;
        height: 50px;
        color: #000;
        border-radius: 50%;
        text-align: center;
        line-height: 50px;
        font-weight: bold;
    }
</style>
