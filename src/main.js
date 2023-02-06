import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { i18n } from '@/plugins/i18n.js'
import './registerServiceWorker'
import axios from 'axios'

import { AvatarPlugin, BadgePlugin, ButtonGroupPlugin, ButtonPlugin, CardPlugin, FormCheckboxPlugin, FormDatepickerPlugin, FormFilePlugin, FormGroupPlugin, FormInputPlugin, FormPlugin, FormRadioPlugin, FormSelectPlugin, ImagePlugin, InputGroupPlugin, LayoutPlugin, ListGroupPlugin, ModalPlugin, NavbarPlugin, PaginationPlugin, SpinnerPlugin, TablePlugin, TooltipPlugin } from 'bootstrap-vue'

Vue.config.productionTip = false

// Set base URL based on environment
let baseUrl = './api/'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

axios.defaults.baseURL = baseUrl

store.commit('BASE_URL_CHANGED', baseUrl)

Vue.use(AvatarPlugin)
Vue.use(BadgePlugin)
Vue.use(ButtonPlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(CardPlugin)
Vue.use(FormPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(FormFilePlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormSelectPlugin)
Vue.use(FormRadioPlugin)
Vue.use(ImagePlugin)
Vue.use(InputGroupPlugin)
Vue.use(LayoutPlugin)
Vue.use(ListGroupPlugin)
Vue.use(ModalPlugin)
Vue.use(NavbarPlugin)
Vue.use(ModalPlugin)
Vue.use(PaginationPlugin)
Vue.use(SpinnerPlugin)
Vue.use(TablePlugin)
Vue.use(TooltipPlugin)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
