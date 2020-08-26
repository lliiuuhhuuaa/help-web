<template>
    <div class="loading-body">
        <div class="loading no-back" v-if="this.$store.state.loadingNoBack">
            <div class="spinner-box spinner-box-inner">
                <div class="pulse-container">
                    <div class="spinner-inner-text">加载中</div>
                    <div class="pulse-bubble pulse-bubble-1"></div>
                    <div class="pulse-bubble pulse-bubble-2"></div>
                    <div class="pulse-bubble pulse-bubble-3"></div>
                </div>
            </div>
        </div>
        <div class="loading" v-else-if="this.$store.state.loading">
            <div class="spinner-box spinner-box-inner">
                <div class="pulse-container">
                    <div class="spinner-inner-text">加载中</div>
                    <div class="pulse-bubble pulse-bubble-1"></div>
                    <div class="pulse-bubble pulse-bubble-2"></div>
                    <div class="pulse-bubble pulse-bubble-3"></div>
                </div>
            </div>
            <div class="spinner-box">
                <div class="circle-border">
                    <div class="circle-core"></div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import "@/assets/css/loading.css";
    export default {
        name: 'loading-body',
    }
</script>