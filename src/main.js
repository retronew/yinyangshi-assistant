import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import routes from './config/routes'
import MuseUI from 'muse-ui'

import 'muse-ui/dist/muse-ui.css'

Vue.use(MuseUI)
Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
	routes
})

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	render: h => h(App)
})
