import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

const HEADING_RE = /^H([1-6])$/
const HEADING_CLS = 'md-heading-collapsible'
const HIDDEN_CLS = 'md-section-hidden'

/**
 * 可折叠标题 Hook
 *
 * 注意：x-markdown-vue 的 AST 是异步解析的，首次渲染时容器里还没有标题；
 * 且渲染结果由 Vue 的 VNode 管理，直接移动/包裹 DOM 节点会被后续 patch 冲掉。
 * 因此这里采用「不移动节点」的方案：
 *   - 只给标题加 class/属性，内容节点按需加 hidden class
 *   - MutationObserver 监听 DOM 变化，异步渲染完成或重渲染后自动重新扫描
 *   - 折叠状态按标题 key 记忆，重渲染后自动恢复
 */
export function useCollapsibleHeadings(getContainer, sources = []) {
  let bound = null
  let observer = null
  let root = null
  let scheduled = false
  const collapsedKeys = new Set()

  const levelOf = (el) => Number(el.tagName.slice(1))
  const headingNodes = () =>
    root ? Array.from(root.children).filter((el) => HEADING_RE.test(el.tagName)) : []

  const setHidden = (el, hidden) => {
    if (el.classList.contains(HIDDEN_CLS) !== hidden) el.classList.toggle(HIDDEN_CLS, hidden)
  }

  /** 按层级计算可见性：标题折叠时，其后直到同级/更高级标题的所有节点都隐藏 */
  function applyVisibility() {
    if (!root) return
    const foldedLevels = []
    for (const el of Array.from(root.children)) {
      if (HEADING_RE.test(el.tagName)) {
        const level = levelOf(el)
        while (foldedLevels.length && foldedLevels[foldedLevels.length - 1] >= level) {
          foldedLevels.pop()
        }
        setHidden(el, foldedLevels.length > 0)
        if (el.classList.contains('collapsed')) foldedLevels.push(level)
      } else {
        setHidden(el, foldedLevels.length > 0)
      }
    }
  }

  /** 扫描容器，初始化标题并恢复折叠状态（幂等，可反复调用） */
  function scan() {
    const container = getContainer()
    if (!container) return

    if (bound !== container) {
      bound?.removeEventListener('click', onClick)
      bound?.removeEventListener('keydown', onKeydown)
      container.addEventListener('click', onClick)
      container.addEventListener('keydown', onKeydown)
      bound = container

      observer?.disconnect()
      observer = new MutationObserver(schedule)
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      })
    }

    // 标题是异步渲染的：现在没有就先返回，等 MutationObserver 触发
    const firstHeading = container.querySelector('h1,h2,h3,h4,h5,h6')
    if (!firstHeading) return

    root = firstHeading.parentElement
    const headings = headingNodes()
    if (!headings.length) return

    headings.forEach((heading, index) => {
      const key = `${levelOf(heading)}:${index}:${heading.textContent.trim().slice(0, 40)}`
      if (!heading.classList.contains(HEADING_CLS)) heading.classList.add(HEADING_CLS)
      if (heading.dataset.mdKey !== key) heading.dataset.mdKey = key
      if (heading.getAttribute('role') !== 'button') heading.setAttribute('role', 'button')
      if (heading.getAttribute('tabindex') !== '0') heading.tabIndex = 0
      if (!heading.getAttribute('title')) heading.setAttribute('title', 'Click to fold / unfold')

      const shouldCollapse = collapsedKeys.has(key)
      if (heading.classList.contains('collapsed') !== shouldCollapse) {
        heading.classList.toggle('collapsed', shouldCollapse)
      }
    })

    applyVisibility()
  }

  function schedule() {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      scan()
    })
  }

  function toggle(heading) {
    heading.classList.toggle('collapsed')
    const key = heading.dataset.mdKey
    if (heading.classList.contains('collapsed')) collapsedKeys.add(key)
    else collapsedKeys.delete(key)
    applyVisibility()
  }

  const findHeading = (target) =>
    target instanceof Element ? target.closest(`.${HEADING_CLS}`) : null

  function onClick(e) {
    // 点击标题内的链接时不折叠
    if (e.target instanceof Element && e.target.closest('a')) return
    const heading = findHeading(e.target)
    if (heading) toggle(heading)
  }

  function onKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const heading = findHeading(e.target)
    if (heading) {
      e.preventDefault()
      toggle(heading)
    }
  }

  const apply = async () => {
    await nextTick()
    schedule()
  }

  const collapseAll = () => {
    headingNodes().forEach((h) => {
      h.classList.add('collapsed')
      collapsedKeys.add(h.dataset.mdKey)
    })
    applyVisibility()
  }

  const expandAll = () => {
    headingNodes().forEach((h) => {
      h.classList.remove('collapsed')
      collapsedKeys.delete(h.dataset.mdKey)
    })
    applyVisibility()
  }

  onMounted(apply)
  // 内容变化（切换文章）时重置折叠状态并重新扫描
  watch(sources, () => {
    collapsedKeys.clear()
    root = null
    apply()
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    observer?.disconnect()
    bound?.removeEventListener('click', onClick)
    bound?.removeEventListener('keydown', onKeydown)
  })

  return { apply, collapseAll, expandAll }
}
