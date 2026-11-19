<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocs } from '../hooks/useDocs'
import MarkdownDoc from '../components/MarkdownDoc.vue'

const props = defineProps({
  /** 为 true 时渲染 ./docs/error.md（/error 路由） */
  isError: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const { getDoc } = useDocs()

// 目录式路由解析：/foo/bar -> 'foo/bar'
const docPath = computed(() => {
  const raw = route.params.pathMatch
  return Array.isArray(raw) ? raw.join('/') : raw ?? ''
})

const content = computed(() => {
  if (props.isError) {
    return getDoc('error') ?? '# 404\n\nNot found, and `./docs/error.md` not found as well.'
  }
  return getDoc(docPath.value)
})

// 文档不存在时自动重定向到 /error
watch(
  content,
  (c) => {
    if (!props.isError && c === null) {
      router.replace({ name: 'error' })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="page">
    <template v-if="isError">
      <div class="error-hero">
        <span class="error-code">404</span>
      </div>
      <MarkdownDoc :content="content" />
    </template>
    <MarkdownDoc v-else-if="content !== null" :content="content" />
  </div>
</template>
