import { createApp } from 'vue'
import App from './App.vue'
import { bootstrap } from './bootstrap'

import 'uno.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './styles/main.less'

const app = createApp(App)
bootstrap(app)
app.mount('#app')
