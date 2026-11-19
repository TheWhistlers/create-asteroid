<script setup>
/**
 * 站点左上角标识，两种模式：
 *   mode="avatar" + target="图片地址" + name="显示名" → 圆形头像 + name 作为文字
 *   mode="name"   + target="foo"                     → 圆形首字母 + target 作为文字
 * 文字规则：avatar 取 name，name 取 target；显式传入的 label 优先级最高（兼容旧用法）。
 * 空值 / 非法 mode / 图片加载失败时统一降级为 name 模式的 "?" 占位，不抛错。
 */
import { computed, ref, watch } from 'vue'

const props = defineProps({
  mode: { type: String, default: '' },
  target: { type: String, default: '' },
  /** avatar 模式下作为文字显示的名字（name 模式下忽略） */
  name: { type: String, default: '' },
  /** 显式指定标识右侧的文字；不传时按 mode 自动取 name / target */
  label: { type: String, default: '' },
})

const MODES = ['avatar', 'name']
const mode = computed(() => {
  const value = String(props.mode ?? '').trim().toLowerCase()
  return MODES.includes(value) ? value : 'name'
})
const target = computed(() => String(props.target ?? '').trim())
/** file:// 下把 /avatar.svg 这类绝对路径转成相对路径，否则会指向盘符根目录 */
const resolvedTarget = computed(() => {
  const value = target.value
  const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:'
  return isFile && value.startsWith('/') && !value.startsWith('//') ? value.slice(1) : value
})
const name = computed(() => String(props.name ?? '').trim())
const label = computed(() => String(props.label ?? '').trim())

/** avatar 用 name，name 用 target；label 是显式覆盖，全为空则不显示文字 */
const displayLabel = computed(() => label.value || (mode.value === 'avatar' ? name.value : target.value))

/** 用展开运算符取第一个字符，避免把 emoji / 代理对切断 */
const initial = computed(() => {
  const first = [...target.value][0]
  return first ? first.toUpperCase() : '?'
})

const imageFailed = ref(false)
watch(target, () => { imageFailed.value = false })

const showAvatar = computed(() =>
  mode.value === 'avatar' && Boolean(target.value) && !imageFailed.value
)
</script>

<template>
  <div class="hero" :aria-label="displayLabel || target || '站点标识'">
    <span class="hero-badge" :class="{ 'hero-badge--avatar': showAvatar }">
      <img
        v-if="showAvatar"
        :src="resolvedTarget"
        alt="站点头像"
        @error="imageFailed = true"
      />
      <span v-else class="hero-initial">{{ initial }}</span>
    </span>
    <span v-if="displayLabel" class="hero-label">{{ displayLabel }}</span>
  </div>
</template>

<style scoped lang="scss">
.hero {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.hero-badge {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  border: 1px solid var(--gh-border);
  background: linear-gradient(135deg, var(--gh-accent-emphasis), var(--gh-accent));
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-initial {
  user-select: none;
}

.hero-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: 600;
  color: var(--gh-fg);
}
</style>
