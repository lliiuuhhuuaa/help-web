<template>
    <div  v-if="process!=null">
        <div class="pie_left"><div class="left" :style="{transform:process*3.6<=180?process*3.6===0?'rotate('+(process*3.6-180)+'deg)':'rotate('+(180-process*3.6)+'deg)':'rotate(0deg)',transition:process*3.6===0?'transform 0.5s ease-in':'transform 0.5s ease'}"></div></div>
        <div class="pie_right"><div class="right" :style="{transform:process*3.6<=180?process*3.6===0?'rotate('+(process*3.6-180)+'deg)':'rotate(180deg)':'rotate('+(360-process*3.6)+'deg)',transform:process*3.6<=180?process*3.6===0?'transform 0.5s ease':false:'transform 0.2s 0.5s ease-in'}"></div></div>
        <div class="process-inner">{{process}}%</div>
    </div>
</template>

<script>
    export default {
        props:{
            process: {
                type: Number,
                default: null
            },
        },
    }
</script>
<style>
    .pie_left, .pie_right{
        width:50px;
        height:50px;
        position: absolute;
        top:0;
        left:0;
    }
    .left, .right{
        position: absolute;
        left:0;
        top:0;
        border-radius:50%;
        width:100%;
        height:100%;
        border: 2px solid #FFF;
    }
    .pie_left, .left{
        clip: rect(auto, 25px, auto, auto);
    }
    .pie_right, .right{
        clip:rect(0, auto, auto, 25px);
    }
</style>