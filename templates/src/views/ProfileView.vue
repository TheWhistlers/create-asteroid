<script setup>
import profileRaw from '../profile.md?raw'
import MarkdownDoc from '../components/MarkdownDoc.vue'
</script>

<template>
  <div class="page">
    <MarkdownDoc :content="profileRaw" />
  </div>
</template>
