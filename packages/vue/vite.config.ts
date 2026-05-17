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
            tsconfigPath: './tsconfig.build.json',
            cleanVueFileName: true,
            // Post-process the generated declarations: rewrite source-path
            // re-exports back to their real package name. vite-plugin-dts
            // follows the workspace path alias when resolving cross-package
            // imports — even when paths are absent from the active tsconfig —
            // and inlines the resolved source path. Consumers would otherwise
            // see imports like `'../../core/src/index.ts'` in our `.d.ts`.
            afterDiagnostic: () => { /* no-op */ },
            beforeWriteFile(filePath, content) {
                // Match any depth of `../` segments leading to `core/src/...`
                // and rewrite the whole specifier to the published package
                // name. Covers both top-level and nested declaration files.
                const rewritten = content.replace(
                    /(['"])(?:\.\.\/)+core\/src\/[^'"]+\1/g,
                    "'@vue-select-plus/core'"
                );
                return { filePath, content: rewritten };
            },
        }),
    ],
    build: {
        sourcemap: true,
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
