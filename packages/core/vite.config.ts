import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            cleanVueFileName: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VueSelectCore',
            fileName: 'index',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})
