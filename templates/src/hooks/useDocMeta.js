import YAML from 'yaml'

// 文档顶部 front matter
const FRONT_MATTER_RE = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/
// 文档末尾的 YAML 脚注块（另一种写法）
const FOOT_META_RE = /\r?\n---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\s*$/

const toArray = (value) => {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value : [value]
}

/** 块内容必须看起来像 YAML，避免把正文里的分隔线误判成元数据 */
function looksLikeYaml(text) {
  return text.split(/\r?\n/).every(
    (line) => !line.trim() || /^\s*(?:#|-\s|[A-Za-z_$][\w$-]*\s*:)/.test(line)
  )
}

/** 参考文献：支持字符串、'标题 | URL'、{ title, url } / { name, link } */
function normalizeReferences(value) {
  return toArray(value).map((item) => {
    if (typeof item === 'string') {
      const [title, url] = item.split(/\s*\|\s*/)
      return url ? { title, url } : { title: item, url: '' }
    }
    if (item && typeof item === 'object') {
      return {
        title: item.title ?? item.name ?? item.text ?? '参考资料',
        url: item.url ?? item.link ?? item.href ?? '',
      }
    }
    return { title: String(item), url: '' }
  })
}

/** 粗略统计：中文按字、英文按词，阅读速度按 300 字/分钟 */
function calcStats(body) {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|[\]()!~-]/g, ' ')
  const chinese = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = (plain.match(/[a-zA-Z0-9]+/g) || []).length
  const count = chinese + words
  return { count, minutes: Math.max(1, Math.ceil(count / 300)) }
}

/**
 * 解析 Markdown 文档中的 YAML 元数据，并返回剥离元数据后的正文
 * 优先读顶部 front matter；没有则尝试文末 YAML 脚注块
 * 代码块内容会被遮蔽，避免示例代码里的 --- 干扰匹配
 */
export function useDocMeta(raw = '') {
  let meta = {}
  let body = raw

  // 挖空 fenced code block，长度保持不变以便索引复用到原文
  const masked = raw.replace(/```[\s\S]*?```/g, (block) => ' '.repeat(block.length))
  const front = masked.match(FRONT_MATTER_RE)
  const foot = front ? null : masked.match(FOOT_META_RE)
  const source = front ?? foot

  if (source && looksLikeYaml(source[1])) {
    try {
      meta = YAML.parse(source[1]) || {}
    } catch (err) {
      console.warn('[doc-meta] YAML 解析失败，已忽略元数据块：', err.message)
      meta = {}
    }
    if (typeof meta !== 'object' || Array.isArray(meta)) meta = {}
    body = front ? raw.slice(front[0].length) : raw.slice(0, foot.index)
  }

  const normalized = {
    title: meta.title ?? '',
    author: toArray(meta.author ?? meta.authors).join('、'),
    date: meta.date != null ? String(meta.date) : '',
    updated: meta.updated != null ? String(meta.updated) : '',
    category: meta.category ?? meta.categories ?? '',
    summary: meta.summary ?? meta.description ?? '',
    keywords: toArray(meta.keywords ?? meta.tags).map(String),
    references: normalizeReferences(meta.references ?? meta.refs),
  }

  return { meta: normalized, body, stats: calcStats(body) }
}
