<script setup>
defineProps({
  meta: { type: Object, required: true },
  stats: { type: Object, required: true },
})

const hasValue = (v) => Array.isArray(v) ? v.length > 0 : Boolean(v)
</script>

<template>
  <aside class="md-doc-info" aria-label="文档信息">
    <div class="gh-card">
      <div class="gh-card-header">Document Information</div>
      <div class="gh-card-body info-body">
        <dl class="info-list">
          <div v-if="hasValue(meta.author)" class="info-row">
            <dt>Author</dt>
            <dd>{{ meta.author }}</dd>
          </div>
          <div v-if="hasValue(meta.date)" class="info-row">
            <dt>Published in</dt>
            <dd><time>{{ meta.date }}</time></dd>
          </div>
          <div v-if="hasValue(meta.updated)" class="info-row">
            <dt>Updated in</dt>
            <dd><time>{{ meta.updated }}</time></dd>
          </div>
          <div v-if="hasValue(meta.category)" class="info-row">
            <dt>Category</dt>
            <dd>{{ Array.isArray(meta.category) ? meta.category.join('、') : meta.category }}</dd>
          </div>
          <div class="info-row">
            <dt>Length</dt>
            <dd>about {{ stats.count }} words · {{ stats.minutes }} min</dd>
          </div>
        </dl>

        <p v-if="hasValue(meta.summary)" class="info-summary">{{ meta.summary }}</p>

        <template v-if="hasValue(meta.keywords)">
          <h3 class="info-section-title">Keywords</h3>
          <div class="info-tags">
            <span v-for="tag in meta.keywords" :key="tag" class="info-tag">{{ tag }}</span>
          </div>
        </template>

        <template v-if="hasValue(meta.references)">
          <h3 class="info-section-title">References</h3>
          <ul class="info-refs">
            <li v-for="(ref, i) in meta.references" :key="`${ref.title}-${i}`">
              <a v-if="ref.url" :href="ref.url" target="_blank" rel="noopener noreferrer">
                {{ ref.title }} <span aria-hidden="true">↗</span>
              </a>
              <span v-else>{{ ref.title }}</span>
            </li>
          </ul>
        </template>

        <p v-if="!hasValue(meta.author) && !hasValue(meta.date) && !hasValue(meta.keywords) && !hasValue(meta.references)" class="info-empty">
          No YAML metadata here, please write YAML metedata if you want to show.
        </p>
      </div>
    </div>
  </aside>
</template>
