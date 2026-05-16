/**
 * Bundle size budgets. CI fails if any limit is exceeded.
 *
 * Targets:
 *   - core:   pure logic, no DOM. Should stay tiny.
 *   - vue:    component + slots + ARIA. Floating UI + virtualizer are external.
 *   - styles: default theme, plain CSS.
 */
module.exports = [
    {
        name: '@vue-select-plus/core',
        path: 'packages/core/dist/index.js',
        limit: '4 KB',
        gzip: true,
        ignore: ['vue']
    },
    {
        name: '@vue-select-plus/vue',
        path: 'packages/vue/dist/index.js',
        limit: '8 KB',
        gzip: true,
        ignore: ['vue', '@vue-select-plus/core', '@floating-ui/vue', '@tanstack/vue-virtual']
    },
    {
        name: '@vue-select-plus/styles (raw)',
        path: 'packages/styles/src/style.css',
        limit: '4 KB',
        gzip: true
    }
];
