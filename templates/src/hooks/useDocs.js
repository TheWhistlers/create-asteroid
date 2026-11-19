// 自动读取 ./docs 文件夹下所有 Markdown 文件
// Vite 的 import.meta.glob 会在构建时收集文件内容（eager + raw）
import { useDocMeta } from './useDocMeta'

const modules = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// 文档表：key 为路由路径（如 'guide/getting-started'），value 为原始 Markdown
const docs = {}
for (const [filePath, raw] of Object.entries(modules)) {
  // '/docs/foo/bar.md' -> 'foo/bar'
  const routePath = filePath.replace(/^\/docs\//, '').replace(/\.md$/, '')
  docs[routePath] = raw
}

/** 提取 Markdown 首个一级标题作为文章标题 */
function extractTitle(raw) {
  const match = raw.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/** 读取单篇文档的展示信息（先剥离 YAML 元数据，避免注释被当成标题） */
function readDocInfo(routePath) {
  const { meta, body } = useDocMeta(docs[routePath])
  return {
    title: meta.title || extractTitle(body) || routePath.split('/').pop(),
    date: meta.date,
    author: meta.author,
    summary: meta.summary,
  }
}

/** 目录优先、同级按名称排序 */
function sortNodes(nodes) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const node of nodes) {
    if (node.type === 'dir') {
      sortNodes(node.children)
      node.count = node.children.reduce((sum, child) => sum + (child.count ?? 1), 0)
    }
  }
  return nodes
}

export function useDocs() {
  /** 按路由路径取文档内容，取不到返回 null */
  const getDoc = (routePath) => docs[routePath] ?? null

  /** 总览页用的文章列表（不含 error 页），保留给需要平铺数据的场景 */
  const listDocs = () =>
    Object.keys(docs)
      .filter((p) => p !== 'error')
      .sort((a, b) => a.localeCompare(b))
      .map((p) => ({ path: `/${p}`, ...readDocInfo(p) }))

  /**
   * 总览页用的目录树：按文件夹层级嵌套，支持任意深度
   * 返回 { root, dirs, total }，dirs 为全部目录的 key（用于全部折叠 / 展开）
   */
  const listDocTree = () => {
    const root = { type: 'dir', name: 'docs', key: '', path: '', children: [], count: 0 }
    const dirs = []
    let total = 0

    for (const routePath of Object.keys(docs)) {
      if (routePath === 'error') continue
      total += 1
      const segments = routePath.split('/')
      let parent = root

      for (let i = 0; i < segments.length - 1; i++) {
        const dirPath = segments.slice(0, i + 1).join('/')
        let dir = parent.children.find((n) => n.type === 'dir' && n.key === dirPath)
        if (!dir) {
          dir = { type: 'dir', name: segments[i], key: dirPath, path: dirPath, children: [] }
          dirs.push(dirPath)
          parent.children.push(dir)
        }
        parent = dir
      }

      parent.children.push({
        type: 'doc',
        key: routePath,
        name: segments[segments.length - 1],
        path: routePath,
        route: `/${routePath}`,
        ...readDocInfo(routePath),
      })
    }

    sortNodes(root.children)
    root.count = total
    return { root, dirs, total }
  }

  return { getDoc, listDocs, listDocTree }
}
