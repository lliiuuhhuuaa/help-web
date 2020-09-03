<template>
    <div class="circle_process" v-if="process!=null">
        <div class="wrapper right">
            <div class="circle rightcircle" :style="{transform:process<=50?'rotate('+ (-135+process*3.6) +'deg)':'rotate(45deg)'}"></div>
        </div>
        <div class="wrapper left">
            <div class="circle leftcircle" :style="{transform:process<=50?'rotate(-135deg)':'rotate('+ (-135+(process-50)*3.6) +'deg)'}"></div>
        </div>
        <div class="process-inner">{{process}}%</div>
    </div>
</template>
<script>
    export default {
        props: {
            process: {
                type: Number, default: null
            },
        },
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
    /*@-webkit-keyframes circle_right{*/
    /*    0%{*/
    /*        -webkit-transform: rotate(-135deg);*/
    /*    }*/
    /*    50%,100%{*/
    /*        -webkit-transform: rotate(45deg);*/
    /*    }*/
    /*}*/
    /*@-webkit-keyframes circle_left{*/
    /*    0%,50%{*/
    /*        -webkit-transform: rotate(-135deg);*/
    /*    }*/
    /*    100%{*/
    /*        -webkit-transform: rotate(45deg);*/
    /*    }*/
    /*    }*/
    /*}*/
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
