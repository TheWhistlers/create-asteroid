import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './styles/index.scss'
import { pageTitle, applyDisplayTheme } from './hooks/useAppConfig'

// 兜底作用域：主题 CSS 异步加载前，Markdown 仍能拿到 Github 主题样式
document.documentElement.dataset.theme = 'github'
document.title = pageTitle

// 先加载配置指定的主题，再挂载应用，避免首屏样式闪烁
;(async () => {
  await applyDisplayTheme()
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})()
