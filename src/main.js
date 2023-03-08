import Vue from 'vue'
import App from './App'
import store from '@/store'
import i18n from '@/plugins/i18n'
import plugins from '@/plugins'

Vue.config.productionTip = false 
App.mpType = 'app'  

// #ifdef H5
// 修复echarts插件在h5点击无效果问题
window.wx = {} 
window.store = store
// #endif

// 初始化项目插件
Vue.use(plugins)

const app = new Vue({ 
    i18n,
    store,
    ...App
})
app.$mount()

export default app
