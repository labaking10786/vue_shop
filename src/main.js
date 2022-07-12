import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/css/global.css'

import { Button, Form, FormItem, Input, Message } from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://192.168.103.119:8888/api/private/v1/'

Vue.prototype.$http = axios
Vue.prototype.$message = Message

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
