// ============================================================
// 'shiki' 伞包的现代替代（shim）
// 基于 @shikijs 细粒度包复刻 shiki 的核心入口：
//   - createHighlighter / getSingletonHighlighter（支持字符串形式的语言/主题名）
//   - bundledLanguages / bundledThemes（懒加载聚合表）
// x-markdown-vue 内部动态 import('shiki')，由 vite alias 指向本文件
// ============================================================

import { createHighlighterCore, createSingletonShorthands } from '@shikijs/core'
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma'
import { bundledLanguages } from './shiki-langs'
import { bundledThemes } from './shiki-themes'

export { bundledLanguages, bundledThemes }

let defaultEnginePromise = null

function getDefaultEngine() {
  if (!defaultEnginePromise) {
    // wasm-inlined 以 base64 内联 wasm，无需额外资源加载
    defaultEnginePromise = createOnigurumaEngine(
      () => import('@shikijs/engine-oniguruma/wasm-inlined')
    )
  }
  return defaultEnginePromise
}

const resolveLang = (lang) => {
  if (typeof lang !== 'string') return lang
  const loader = bundledLanguages[lang]
  if (!loader) throw new Error(`[shiki-shim] Unknown language: ${lang}`)
  return loader
}

const resolveTheme = (theme) => {
  if (typeof theme !== 'string') return theme
  const loader = bundledThemes[theme]
  if (!loader) throw new Error(`[shiki-shim] Unknown theme: ${theme}`)
  return loader
}

/** 与 shiki 伞包同名 API：创建高亮器（默认 Oniguruma 引擎，语言/主题支持字符串名懒加载） */
export async function createHighlighter(options = {}) {
  const { engine, langs = [], themes = [], ...rest } = options
  const highlighter = await createHighlighterCore({
    ...rest,
    engine: engine ?? getDefaultEngine(),
    langs: langs.map(resolveLang),
    themes: themes.map(resolveTheme),
  })

  // 复刻伞包行为：运行时 loadLanguage/loadTheme 同样接受字符串名
  const _loadLanguage = highlighter.loadLanguage.bind(highlighter)
  const _loadTheme = highlighter.loadTheme?.bind(highlighter)
  highlighter.loadLanguage = (...langs) => _loadLanguage(...langs.map(resolveLang))
  if (_loadTheme) {
    highlighter.loadTheme = (...themes) => _loadTheme(...themes.map(resolveTheme))
  }

  return highlighter
}

const shorthands = createSingletonShorthands(createHighlighter)

/** 与 shiki 伞包同名 API：单例高亮器（x-markdown-vue 使用的就是它） */
export const getSingletonHighlighter = shorthands.getSingletonHighlighter
export const codeToHtml = shorthands.codeToHtml
export const codeToTokens = shorthands.codeToTokens
export const codeToTokensBase = shorthands.codeToTokensBase

export { createHighlighterCore, createSingletonShorthands }
