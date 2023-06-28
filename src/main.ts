
import naive from 'naive-ui'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { key, store } from './store'
import WSUtils from './websocket'
// WSUtils.debug();
WSUtils.init("ws://gem.xhystudy.cn:12345/ws", () => {
  console.log("链接成功")
}, () => {
  console.log("断开连接")
}, null
)
/* WSUtils.init("ws://192.168.191.158:12345/ws", () => {
  console.log("链接成功")
}, () => {
  console.log("断开连接")
}, null
) */


const app = createApp(App)
app.config.globalProperties.$WSUtils = WSUtils;
app.use(store, key)
app.use(naive)
app.use(router)
app.mount("#app")
