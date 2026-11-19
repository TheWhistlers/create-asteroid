<script setup>
/**
 * 递归目录树节点：文件夹可折叠，文件为路由链接
 * 自引用依赖 SFC 文件名 DocTree.vue（Vue 3 <script setup> 支持按文件名隐式自引用）
 */
const props = defineProps({
  nodes: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  /** 折叠状态表，由总览页持有，便于「全部折叠 / 展开」统一控制 */
  state: { type: Object, required: true },
})

const indent = (depth) => `${16 + depth * 22}px`
const isCollapsed = (key) => Boolean(props.state[key])
const toggle = (key) => { props.state[key] = !props.state[key] }
</script>

<template>
  <ul class="doc-tree">
    <li v-for="node in nodes" :key="node.key" class="doc-tree-item">
      <template v-if="node.type === 'dir'">
        <button
          class="doc-tree-row doc-tree-dir"
          type="button"
          :style="{ paddingLeft: indent(depth) }"
          :aria-expanded="String(!isCollapsed(node.key))"
          @click="toggle(node.key)"
        >
          <svg
            class="tree-caret"
            :class="{ collapsed: isCollapsed(node.key) }"
            width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"
          >
            <path d="M12.78 6.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.28a.75.75 0 0 1 1.06-1.06L8 9.94l3.72-3.72a.75.75 0 0 1 1.06 0Z" />
          </svg>
          <svg class="tree-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z" />
          </svg>
          <span class="tree-name">{{ node.name }}</span>
          <span class="tree-count">{{ node.count }}</span>
        </button>
        <DocTree
          v-show="!isCollapsed(node.key)"
          :nodes="node.children"
          :depth="depth + 1"
          :state="state"
        />
      </template>

      <router-link
        v-else
        class="doc-tree-row doc-tree-file"
        :to="node.route"
        :style="{ paddingLeft: indent(depth) }"
        :title="node.summary || `${node.path}.md`"
      >
        <span class="tree-caret tree-caret--placeholder" aria-hidden="true"></span>
        <svg class="tree-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914Z" />
        </svg>
        <span class="tree-name">{{ node.title }}</span>
        <span class="tree-meta">
          <span v-if="node.date" class="tree-date">{{ node.date }}</span>
          <span class="tree-path">{{ node.path }}.md</span>
        </span>
      </router-link>
    </li>
  </ul>
</template>
