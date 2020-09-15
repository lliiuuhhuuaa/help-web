<template>
    <div id="refresh-scroll"
         :class="{'down':(state===0),'up':(state==1),refresh:(state===2),touch:touching}"
         @touchstart="touchStart($event)"
         @touchmove="touchMove($event)"
         @touchend="touchEnd($event)" @scroll="scrollEvent">
        <section class="inner" :style="{ transform: 'translate3d(0, ' + top + 'px, 0)' }">
            <header class="pull-refresh">
                <slot name="pull-refresh">
                    <span class="down-tip">{{downText}}</span>
                    <span class="up-tip">松开加载</span>
                    <span class="refresh-tip">{{refreshText}}</span>
                </slot>
            </header>
            <slot></slot>
        </section>
    </div>
</template>

<script>
    export default {
        props: {
            offset: {
                type: Number,
                default: 40
            },

            enableRefresh: {
                type: Boolean,
                default: true
            },
            onRefresh: {
                type: Function,
                default: undefined,
                required: false
            }
        },
        data() {
            return {
                top: 0,
                state: 0,
                startY: 0,
                touching: false,
                refreshText:'加载中...',
                downText:'下拉加载聊天记录',
            }
        },
        methods: {
            touchStart(e) {
                this.startY = e.targetTouches[0].pageY;
                this.startScroll = this.$el.scrollTop || 0;
                this.touching = true
                let el = document.getElementById("refresh-scroll");
                this.$store.state.lastScrollHeight = el.scrollHeight;
            },
            touchMove(e) {
                if (!this.enableRefresh || this.$el.scrollTop > 0 || !this.touching) {
                    return
                }
                let diff = e.targetTouches[0].pageY - this.startY - this.startScroll;
                if (diff > 0){
                    e.preventDefault();
                }
                this.top = Math.pow(diff, 0.8) + (this.state === 2 ? this.offset : 0);

                if (this.state === 2) { // in refreshing
                    return
                }
                if (this.top >= this.offset) {
                    this.state = 1
                } else {
                    this.state = 0
                }
            },
            touchEnd() {
                if (!this.enableRefresh) return
                this.touching = false;
                if (this.state === 2) { // in refreshing
                    this.state = 2;
                    this.top = this.offset
                    return
                }
                if (this.top >= this.offset) { // do refresh
                    this.refresh()
                } else { // cancel refresh
                    this.state = 0;
                    this.top = 0
                }
            },
            refresh() {
                this.state = 2;
                this.top = this.offset;
                this.onRefresh(this.refreshDone)
            },
            refreshDone(msg) {
                this.refreshText = msg;
                this.downText = "";
                setTimeout(()=>{
                    this.state = 0;
                    this.top = 0
                },500);
                setTimeout(()=>{
                    this.refreshText = "加载中...";
                    this.downText = "下拉加载聊天记录";
                },1000)
            },
            //滚动条滚动事件
            scrollEvent(){
                //标记滚动到底部
                let el = document.getElementById("refresh-scroll");
                if(this.$store.state.activeUserId>0){
                    this.$store.state.showScrollBottom = el.scrollHeight-el.scrollTop-20>el.offsetHeight;
                }
            }
        }
    }
</script>
<style>
    .pull-refresh{
        z-index: 1000;
    }
    #refresh-scroll {
        height: 100%;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
    #refresh-scroll .inner {
        position: relative;
        top: -30px;
        width: 100%;
        height: 100%;
        transition-duration: 300ms;
    }
    #refresh-scroll .pull-refresh {
        position: relative;
        left: 0;
        top: 0;
        width: 100%;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #refresh-scroll.touch .inner {
        transition-duration: 0ms;
    }
    #refresh-scroll.down .down-tip {
        display: block;
    }
    #refresh-scroll.up .up-tip {
        display: block;
    }
    #refresh-scroll.refresh .refresh-tip {
        display: block;
    }
    #refresh-scroll .down-tip,
    #refresh-scroll .refresh-tip,
    #refresh-scroll .up-tip {
        display: none;
    }
</style>