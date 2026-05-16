import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    resolve: {
        alias: {
            '@vue-select-plus/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
            '@vue-select-plus/styles': fileURLToPath(new URL('../styles/src/style.css', import.meta.url))
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,spec}.{js,ts}'],
        setupFiles: ['./src/__tests__/setup.ts']
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
            external: [
                'vue',
                '@vue-select-plus/core',
                '@vue-select-plus/styles',
                '@tanstack/vue-virtual',
                '@floating-ui/vue'
            ],
            output: {
                exports: 'named',
                globals: {
                    vue: 'Vue',
                    '@vue-select-plus/core': 'VueSelectPlusCore',
                    '@vue-select-plus/styles': 'VueSelectPlusStyles',
                    '@tanstack/vue-virtual': 'TanstackVueVirtual',
                    '@floating-ui/vue': 'FloatingUIVue',
                },
            },
        },
    },
})
