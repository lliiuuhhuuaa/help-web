<template>
    <div @click="constant.zoomImgSrc=null"
         class="zoom-img-body" v-if="constant.zoomImgSrc" ><img :src="constant.zoomImgSrc"/></div>
</template>

<script>
    export default {
        data() {
            return {
                constant: this.$store.state,
            }
        },
        computed: {
            //图片放大监听
            zoomImgSrc() {
                return this.constant.zoomImgSrc;
            },
        },
        watch: {
            zoomImgSrc: function (val) {
                if(!val){
                    document.removeEventListener("keypress",() => {});
                    return;
                }
                let _this = this;
                document.addEventListener("keyup",function (e) {
                    if(e.code==="Escape"){
                        _this.constant.zoomImgSrc=null;
                    }
                });
            },
        }
    }
</script>
<style>
    .zoom-img-body{
        width: 100%;
        height: 100%;
        position: absolute;
        top:0;left: 0;right: 0;bottom: 0;
        background: rgba(255,255,255,0.9);
        z-index:100;
        display: flex;/*设为 Flex 布局以后，子元素的float、clear和vertical-align属性将失效*/
        display: -webkit-flex; /* Safari */
        flex-direction: column;/*容器内项目的排列方向(默认横向排列 row)*/
        flex-wrap: nowrap;/*容器内项目换行方式*/
        justify-content: center;/*项目在主轴上的对齐方式*/
        align-items: center;/*项目在交叉轴上如何对齐*/
        align-content: center;/*定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用*/
    }
</style>