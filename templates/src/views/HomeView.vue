<script setup>
import { computed, reactive } from 'vue'
import { useDocs } from '../hooks/useDocs'
import DocTree from '../components/DocTree.vue'

const { listDocTree } = useDocs()
const tree = listDocTree()

const state = reactive(Object.fromEntries(tree.dirs.map((key) => [key, true])))
const hasCollapsed = computed(() => tree.dirs.some((key) => state[key]))
const allCollapsed = computed(() => tree.dirs.length > 0 && tree.dirs.every((key) => state[key]))
const collapseAll = () => tree.dirs.forEach((key) => { state[key] = true })
const expandAll = () => tree.dirs.forEach((key) => { delete state[key] })
</script>

<template>
  <div class="page page--narrow">
    <h1 class="page-title">Documents Overview</h1>
    <p class="page-subtitle">
      Listed all the documents in <code>./docs</code>, {{ tree.total }} files in total、{{ tree.dirs.length }} directories in total。
    </p>

    <div v-if="tree.total" class="gh-card doc-tree-card">
      <div class="doc-tree-header">
        <svg class="tree-root-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V1.5h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <span class="tree-root-name">docs</span>
        <span class="tree-root-slash">/</span>
        <span class="tree-header-meta">{{ tree.total }} documents</span>
        <div class="doc-tree-actions">
          <button class="gh-btn" type="button" :disabled="!hasCollapsed" @click="expandAll">Unfold all</button>
          <button class="gh-btn" type="button" :disabled="allCollapsed" @click="collapseAll">Fold all</button>
        </div>
      </div>

      <DocTree :nodes="tree.root.children" :state="state" />
    </div>

    <div v-else class="gh-card">
      <div class="gh-card-body">
        <code>./docs</code> is empty, put some Markdown documents here.
      </div>
    </div>
  </div>
</template>
