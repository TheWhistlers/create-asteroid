import { nextTick, onBeforeUnmount, onMounted, shallowRef, ref, watch } from 'vue'

const HEADING_RE = /^H([1-6])$/
const STICKY_OFFSET = 86 // sticky 顶栏 62px + 呼吸空间

/**
 * 根据渲染后的 Markdown DOM 生成可跳转大纲
 * - x-markdown-vue 是异步渲染的，用 MutationObserver 在标题出现后自动构建
 * - 点击大纲项：自动展开折叠的祖先章节，再平滑滚动到对应标题
 * - 滚动时高亮当前所在章节
 *
 * @param {() => HTMLElement | null} getContainer 渲染结果容器
 * @param {import('vue').WatchSource[]} sources 内容变化源
 */
export function useMarkdownOutline(getContainer, sources = []) {
  // DOM 元素放进 shallowRef，避免被 Vue 深度响应式代理
  const outline = shallowRef([])
  const activeKey = ref('')
  let bound = null
  let observer = null
  let signature = ''
  let scheduled = false
  let scrollFrame = 0

  function build() {
    const container = getContainer()
    if (!container) return
    if (bound !== container) {
      observer?.disconnect()
      observer = new MutationObserver(schedule)
      observer.observe(container, { childList: true, subtree: true })
      bound = container
    }

    const headings = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    const nextSignature = headings.map((h) => `${h.tagName}:${h.textContent.trim()}`).join('|')
    if (nextSignature === signature) return
    signature = nextSignature

    outline.value = headings.map((el, index) => ({
      key: `${el.tagName}-${index}-${el.textContent.trim().slice(0, 40)}`,
      text: el.textContent.trim() || '未命名标题',
      level: Number(el.tagName.slice(1)),
      el,
    }))
    updateActive()
  }

  function schedule() {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      build()
    })
  }

  /** 展开目标标题之上的所有折叠章节（复用折叠 hook 的点击委托） */
  function expandAncestors(target) {
    const root = target?.parentElement
    if (!root) return
    const folded = []
    for (const node of Array.from(root.children)) {
      if (node === target) break
      if (HEADING_RE.test(node.tagName)) {
        const level = levelOf(node)
        while (folded.length && folded[folded.length - 1].level >= level) folded.pop()
        if (node.classList.contains('collapsed')) folded.push({ level, el: node })
      }
    }
    folded.forEach(({ el }) => el.click())
  }

  const levelOf = (el) => Number(el.tagName.slice(1))

  function jumpTo(item) {
    let target = item.el
    if (!target?.isConnected) {
      build()
      target = outline.value.find((i) => i.key === item.key)?.el
    }
    if (!target) return
    expandAncestors(target)

    const desired = Math.max(0, target.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET)
    // 文档末尾章节可能滚不到视口顶部：按需补充底部可滚动空间
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const main = target.closest('.md-main')
    if (main && desired > maxScroll) {
      const extra = Math.ceil(desired - maxScroll)
      const current = Number.parseFloat(main.style.getPropertyValue('--md-tail-extra')) || 0
      if (extra > current) main.style.setProperty('--md-tail-extra', `${extra}px`)
    }
    // 等布局高度生效后再滚动
    requestAnimationFrame(() => window.scrollTo({ top: desired, behavior: 'smooth' }))
    activeKey.value = item.key
  }

  function updateActive() {
    const items = outline.value
    if (!items.length) return
    let current = items[0].key
    for (const item of items) {
      if (!item.el?.isConnected || item.el.classList.contains('md-section-hidden')) continue
      // 容差：平滑滚动结束时标题位置可能带小数（如 86.4px）
      if (item.el.getBoundingClientRect().top <= STICKY_OFFSET + 8) current = item.key
      else break
    }
    activeKey.value = current
  }

  function onScroll() {
    if (scrollFrame) return
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0
      updateActive()
    })
  }

  const apply = async () => {
    await nextTick()
    schedule()
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    apply()
  })

  watch(sources, () => {
    signature = ''
    outline.value = []
    activeKey.value = ''
    getContainer()?.closest('.md-main')?.style.removeProperty('--md-tail-extra')
    window.scrollTo({ top: 0 })
    apply()
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
  })

  return { outline, activeKey, jumpTo }
}
