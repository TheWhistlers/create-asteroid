<script setup>
import Hero from './components/Hero.vue'
import { useTheme } from './hooks/useTheme'
import { hero, pageTitle } from './hooks/useAppConfig'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="gh-header">
    <router-link class="brand" to="/">
      <Hero
        v-if="hero"
        :mode="hero.mode"
        :target="hero.target"
        :name="hero.name"
        :label="hero.label"
      />
      <span v-else class="brand-fallback">{{ pageTitle }}</span>
    </router-link>

    <nav>
      <router-link to="/">Overview</router-link>
      <router-link to="/profile">About</router-link>
    </nav>

    <button class="gh-btn" type="button" @click="toggleTheme">
      <span v-if="isDark">🌞 Light</span>
      <span v-else>🌙 Dark</span>
    </button>
  </header>

  <router-view />

  <footer class="gh-footer">
    <p>Powered by Vue 3 + Vite + x-markdown-vue | Released under the MIT License.</p>
    <p>Copyright © 2026 | Whistler</p>
  </footer>
</template>
