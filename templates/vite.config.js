import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 共享配置：标准构建与离线单文件构建都复用
// base 用相对路径，产物放到服务器任意目录/子路径都不会因 /assets 绝对路径而白屏
export const sharedConfig = {
  base: './',
  plugins: [vue()],
  resolve: {
    alias: [
      // shiki-stream 已更名为 @shikijs/stream（API 一致）
      { find: /^shiki-stream$/, replacement: '@shikijs/stream' },
      // shiki 伞包 -> 基于 @shikijs 细粒度包的本地 shim
      { find: /^shiki$/, replacement: fileURLToPath(new URL('./src/shims/shiki.js', import.meta.url)) },
    ],
  },
}

// https://vite.dev/config/
export default defineConfig(sharedConfig)
