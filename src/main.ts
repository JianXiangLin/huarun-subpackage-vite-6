import 'vue/jsx'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 引入windi css
import '@/plugins/unocss'
// 导入全局的svg图标
import '@/plugins/svgIcon'
// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'
// 引入状态管理
import { setupStore } from '@/store'
// 引入element-plus
import { setupElementPlus } from '@/plugins/elementPlus'
// 全局组件
import { setupGlobCom } from '@/components'
// 引入全局样式
import '@/styles/index.less'
// 引入qiankun
import './public-path'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let instance: any = null
async function render(props: any = {}) {
  const { container, userInfo } = props
  instance = createApp(App)
  await setupI18n(instance)
  setupStore(instance)
  setupElementPlus(instance)
  setupGlobCom(instance)
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
