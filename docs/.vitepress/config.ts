import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'
import path from 'path';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/vue-select-plus/',
    title: "Vue Select Plus",
    description: "Enterprise-grade Headless Select Component for Vue 3",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Core', link: '/core/getting-started' },
            { text: 'Vue', link: '/vue/getting-started' },
            { text: 'Examples', link: '/vue/examples' }
        ],

        sidebar: {
            '/core/': [
                {
                    text: 'Core Guide',
                    items: [
                        { text: 'Getting Started', link: '/core/getting-started' },
                        { text: 'API Reference', link: '/core/api' }
                    ]
                }
            ],
            '/vue/': [
                {
                    text: 'Vue Guide',
                    items: [
                        { text: 'Getting Started', link: '/vue/getting-started' },
                        { text: 'Examples', link: '/vue/examples' },
                        { text: 'API Reference', link: '/vue/api' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vue-select-plus/vue-select-plus' }
        ]
    },
    vite: {
        resolve: {
            alias: [
                {
                    find: /^@vue-select-plus\/vue$/,
                    replacement: fileURLToPath(new URL('../../packages/vue/src/index.ts', import.meta.url))
                },
                {
                    find: /^@vue-select-plus\/core$/,
                    replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
                },
                {
                    find: /^@vue-select-plus\/styles$/,
                    replacement: fileURLToPath(new URL('../../packages/styles/src/style.css', import.meta.url))
                }
            ]
        }
    }
})
