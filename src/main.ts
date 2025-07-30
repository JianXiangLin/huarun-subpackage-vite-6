import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './store'

import './public-path'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let instance: any = null
function render(props: any = {}) {
  const { container, userInfo } = props

  instance = createApp(App)
  instance.use(pinia)
  instance.use(router)
  instance.config.globalProperties.userInfo = userInfo
  // 如果是乾坤环境，注入 props
  if (props) {
    instance.config.globalProperties.$qiankunProps = props

    // 监听路由变化
    router.afterEach((to) => {
      const title = to.meta?.title || '默认标题'
      props.onSubRouteChange?.(title)
    })
  }
  instance.mount(container ? container : '#app')
}

// 独立运行时
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}

renderWithQiankun({
  bootstrap() {
    // do nothing.
  },
  mount(props) {
    console.log(props)
    render(props)
  },
  unmount() {
    instance.unmount()
    instance._container.innerHTML = ''
    instance = null
  },
  update() {
    // do nothing
  }
})
