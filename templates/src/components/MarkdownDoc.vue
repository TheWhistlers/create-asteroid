<script setup>
import { computed, ref } from 'vue'
import { MarkdownRenderer } from 'x-markdown-vue'
import 'x-markdown-vue/style'
import { useTheme } from '../hooks/useTheme'
import { useDocMeta } from '../hooks/useDocMeta'
import { useCollapsibleHeadings } from '../hooks/useCollapsibleHeadings'
import { useMarkdownOutline } from '../hooks/useMarkdownOutline'
import { shikiTheme } from '../hooks/useAppConfig'
import DocInfoPanel from './DocInfoPanel.vue'

const props = defineProps({
  /** 原始 Markdown 文本（可含 YAML 元数据块） */
  content: {
    type: String,
    default: '',
  },
})

const { isDark } = useTheme()

// YAML 元数据只用于右侧信息栏，不参与正文渲染
const docMeta = computed(() => useDocMeta(props.content))
const renderBody = computed(() => docMeta.value.body)

const bodyRef = ref(null)
const sources = [() => props.content]
const { collapseAll, expandAll } = useCollapsibleHeadings(() => bodyRef.value, sources)
const { outline, activeKey, jumpTo } = useMarkdownOutline(() => bodyRef.value, sources)
</script>

<template>
  <div class="md-layout">
    <aside v-if="outline.length" class="md-outline" aria-label="文档大纲">
      <div class="md-outline-title">Contents</div>
      <nav>
        <a
          v-for="item in outline"
          :key="item.key"
          :href="`#${encodeURIComponent(item.text)}`"
          :class="['md-outline-item', `lv-${item.level}`, { active: activeKey === item.key }]"
          :title="item.text"
          @click.prevent="jumpTo(item)"
        >{{ item.text }}</a>
      </nav>
    </aside>

    <main class="md-main">
      <div class="markdown-wrap">
        <div class="md-toolbar">
          <span class="md-toolbar-tip">Click titles to fold / unfold chapters</span>
          <button class="gh-btn" type="button" @click="collapseAll">Fold all</button>
          <button class="gh-btn" type="button" @click="expandAll">Unfold all</button>
        </div>
        <div ref="bodyRef" class="markdown-body">
          <MarkdownRenderer :markdown="renderBody" :is-dark="isDark" :shiki-theme="shikiTheme" />
        </div>
      </div>
    </main>

    <DocInfoPanel :meta="docMeta.meta" :stats="docMeta.stats" />
  </div>
</template>
