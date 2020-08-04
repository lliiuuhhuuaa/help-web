import Vue from 'vue'
import App from './App.vue'
import {Emit} from './emit/emit.js'
Vue.config.productionTip = false
Vue.prototype.Emit = Emit
new Vue({
  render: h => h(App),
}).$mount('#app')
