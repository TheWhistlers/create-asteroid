import { ref, watch } from 'vue'

const STORAGE_KEY = 'asteroid-theme'

// file:// 等环境可能禁用 localStorage，读写都要兜底，不能因此让页面白屏
const readStoredTheme = () => {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}
const storeTheme = (dark) => {
  try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light') } catch { /* 忽略：无存储权限时仅本次会话生效 */ }
}

// 模块级单例：全局共享同一份主题状态
const isDark = ref(
  (() => {
    const saved = readStoredTheme()
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })()
)

function applyTheme(dark) {
  // 暗黑 / 光亮模式通过 html 上的 class 切换，样式由 Sass 作用域控制
  document.documentElement.classList.toggle('dark', dark)
}

watch(isDark, (dark) => {
  applyTheme(dark)
  storeTheme(dark)
}, { immediate: true })

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }
  return { isDark, toggleTheme }
}
