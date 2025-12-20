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
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'Examples', link: '/guide/examples' }
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Getting Started', link: '/guide/getting-started' },
                    { text: 'Examples', link: '/guide/examples' },
                    { text: 'API Reference', link: '/guide/api' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vue-select-plus/vue-select-plus' }
        ]
    },
    vite: {
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('../../src', import.meta.url))
            }
        }
    }
})
