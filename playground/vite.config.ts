import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [
    vue(),
    // dts() removed as playground is an app
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vue-select-plus/core': fileURLToPath(new URL('../packages/core/src/index.ts', import.meta.url)),
      '@vue-select-plus/vue': fileURLToPath(new URL('../packages/vue/src/index.ts', import.meta.url)),
      '@vue-select-plus/styles': fileURLToPath(new URL('../packages/styles/src/style.css', import.meta.url))
    },
  },
})
