import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
    plugins: [
        vue(),
        dts({
            tsconfigPath: './tsconfig.json',
            cleanVueFileName: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VueSelectPlus',
            fileName: 'index',
        },
        rollupOptions: {
            external: ['vue', '@vue-select-plus/core', '@vue-select-plus/styles'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})
