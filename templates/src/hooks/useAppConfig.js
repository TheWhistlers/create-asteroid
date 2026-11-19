// ============================================================
// 读取项目根目录的 asteroid.config.json，并解析 display 配置
//   display.title           页面标题
//   display.hero            左上角 Hero（false / 对象 { enabled, mode, target, name }）
//   display.theme           主题 Scss 文件路径（内置别名或任意 src 下的 .scss）
//   display.shikiTheme      可选，[light, dark] 代码高亮主题；不填则按主题自动配套
// ============================================================
import rawConfig from '../../asteroid.config.json'

const DEFAULT_TITLE = 'Asteroid | 个人博客'
const DEFAULT_THEME = 'github'

const BUILTIN_THEMES = {
  github: 'src/styles/themes/github.scss',
  vue: 'src/styles/themes/vue.scss',
  atom: 'src/styles/themes/atom.scss',
}

// 各主题配套的代码高亮（shiki）主题：[光亮, 暗黑]
const SHIKI_THEMES = {
  github: ['github-light', 'github-dark'],
  vue: ['vitesse-light', 'vitesse-dark'],
  atom: ['one-light', 'one-dark-pro'],
}
const FALLBACK_SHIKI = ['vitesse-light', 'vitesse-dark']

// 收集 src 下所有 scss：display.theme 可以指向任意自定义主题文件
// 排除基础样式与 Sass partial（它们不是主题入口）
const themeModules = import.meta.glob([
  '/src/**/*.scss',
  '!/src/styles/index.scss',
  '!/src/styles/_*.scss',
])

const display =
  rawConfig?.display && typeof rawConfig.display === 'object' && !Array.isArray(rawConfig.display)
    ? rawConfig.display
    : {}

const str = (value) => (typeof value === 'string' ? value.trim() : '')

export const pageTitle = str(display.title) || DEFAULT_TITLE

/**
 * Hero 配置归一化：关闭或格式非法时返回 null；其余交给组件做空值兜底。
 * 文字来源按 mode 区分：
 *   avatar → display.hero.name（此时 target 是图片地址，不适合当文字）
 *   name   → display.hero.target（此时 target 本身就是名字）
 * 取到的文字为空时回退站点标题，避免顶栏出现空白。
 */
export const hero = (() => {
  const h = display.hero
  if (h === false || h == null) return null
  if (typeof h === 'string') {
    const target = h.trim()
    return { mode: 'name', target, name: '', label: target || pageTitle }
  }
  if (typeof h !== 'object' || Array.isArray(h) || h.enabled === false) return null

  const mode = str(h.mode).toLowerCase()
  const target = str(h.target)
  const name = str(h.name)
  const text = mode === 'avatar' ? name : target
  return { mode, target, name, label: text || pageTitle }
})()

/**
 * 把配置值解析成 { name, path }：
 *   - 'github' / 'Vue Themes' / 'atom' 等别名 → 内置主题
 *   - 任意 scss 路径（可省略 src/ 前缀与 .scss 后缀）→ 自定义主题
 *   - 空值 → 默认 Github Themes
 */
export function resolveTheme(value) {
  const raw = str(value)
  const alias = raw.toLowerCase().replace(/[\s_-]+/g, ' ').replace(/\bthemes?\b/g, '').trim()
  if (BUILTIN_THEMES[alias]) {
    return { name: alias, path: `/${BUILTIN_THEMES[alias]}` }
  }
  if (!raw) return { name: DEFAULT_THEME, path: `/${BUILTIN_THEMES[DEFAULT_THEME]}` }

  let path = raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '')
  if (!path.startsWith('src/')) path = `src/${path}`
  if (!path.endsWith('.scss')) path += '.scss'
  const name = path.split('/').pop().replace(/\.scss$/, '').toLowerCase() || DEFAULT_THEME
  return { name, path: `/${path}` }
}

export const theme = resolveTheme(display.theme)

export const shikiTheme = (() => {
  const custom = display.shikiTheme
  if (Array.isArray(custom) && custom.length === 2 && custom.every((item) => str(item))) {
    return [custom[0].trim(), custom[1].trim()]
  }
  return SHIKI_THEMES[theme.name] ?? FALLBACK_SHIKI
})()

/** 按需加载主题样式（构建时静态分析所有 scss，运行时只加载命中的那一个） */
export async function applyDisplayTheme() {
  const root = document.documentElement
  const load = async (target) => {
    const loader = themeModules[target.path]
    if (!loader) throw new Error(`找不到主题文件 ${target.path}`)
    // 先设置 data-theme，CSS 注入时作用域选择器即可命中
    root.dataset.theme = target.name
    await loader()
  }

  try {
    await load(theme)
  } catch (err) {
    console.warn(`[asteroid] 主题加载失败：${err.message}，已回退到 Github Themes`)
    try {
      await load(resolveTheme(DEFAULT_THEME))
    } catch (fallbackErr) {
      console.error('[asteroid] 默认主题加载失败：', fallbackErr)
    }
  }
  return root.dataset.theme
}

export function useAppConfig() {
  return { config: rawConfig, display, pageTitle, hero, theme, shikiTheme }
}
