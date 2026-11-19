import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { sharedConfig } from './vite.config.js'

// 离线单文件构建：把所有 JS / CSS / 主题 / 高亮语言内联进 dist/standalone/index.html。
// 浏览器不允许 file:// 页面加载外部 ES module，只有内联后双击 index.html 才能直接显示。
export default defineConfig({
  ...sharedConfig,
  plugins: [
    ...sharedConfig.plugins,
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
  build: {
    // 单独放子目录，不覆盖可部署的标准产物 dist/index.html
    outDir: 'dist/standalone',
    emptyOutDir: true,
  },
})
