# @vue-select-plus/vue

[![npm version](https://img.shields.io/npm/v/@vue-select-plus/vue?style=flat-square&color=41d1ff)](https://www.npmjs.com/package/@vue-select-plus/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@vue-select-plus/vue?label=gzipped&style=flat-square)](https://bundlephobia.com/package/@vue-select-plus/vue)
[![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-3178C6?style=flat-square)](https://www.typescriptlang.org/)

The Vue 3 component for **Vue Select Plus** — an accessible, headless, enterprise-ready select.

📘 **Docs**: <https://vue-select-plus.github.io/vue-select-plus/>

## Highlights

- 🦾 **WAI-ARIA 1.2 combobox pattern** — proper roles, labels, focus management, live regions.
- 🌲 **Tree support** — infinite nesting with keyboard expand/collapse navigation.
- 🔍 **Searchable** — client filtering out of the box, or server-side via `@search` + `:filterable="false"`.
- ⏳ **Async-ready** — `loading`, `aria-busy`, debounce, min-search-length.
- 🏷️ **Multi-select** — tags with keyboard-reachable remove buttons.
- 🪟 **Floating UI** — auto-flip, viewport-aware, teleports to `<body>` to escape clipping.
- 📋 **Native form integration** — pass `name`, get hidden `<input>`s that serialize via `FormData`.
- 🎨 **Themeable** — CSS variables, automatic dark mode, `forced-colors`, `prefers-reduced-motion`.
- 🚀 **Virtualized** — handles 100k+ options without lag.
- 🦺 **TypeScript-first** — strict types, SSR-safe IDs via Vue 3.5's `useId()`.

## Install

```bash
npm install @vue-select-plus/vue
```

Requires **Vue 3.5+**. The default stylesheet ships inside this package — no
separate install needed. (If you prefer to install it explicitly,
`@vue-select-plus/styles` is still available; both paths resolve to the
same CSS.)

## Quickstart

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VSelect, type SelectOption } from '@vue-select-plus/vue';
import '@vue-select-plus/vue/styles.css';

const fruit = ref<string | null>(null);
const options: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' }
];
</script>

<template>
    <VSelect
        v-model="fruit"
        :options="options"
        label="Choose a fruit"
        placeholder="Pick one…"
        searchable
        clearable
    />
</template>
```

## Sibling packages

| Package | What |
| :--- | :--- |
| [`@vue-select-plus/vue`](https://www.npmjs.com/package/@vue-select-plus/vue) (you are here) | The Vue 3 component. |
| [`@vue-select-plus/core`](https://www.npmjs.com/package/@vue-select-plus/core) | Headless composables — bring your own UI. |
| [`@vue-select-plus/styles`](https://www.npmjs.com/package/@vue-select-plus/styles) | Default theme. Override the CSS variables to skin it. |

## Docs

- [Getting Started](https://vue-select-plus.github.io/vue-select-plus/vue/getting-started)
- [Examples](https://vue-select-plus.github.io/vue-select-plus/vue/examples) — async search, native forms, creator mode, trees
- [API Reference](https://vue-select-plus.github.io/vue-select-plus/vue/api)
- [Accessibility](https://vue-select-plus.github.io/vue-select-plus/vue/accessibility) — WCAG 2.1 compliance map
- [SSR / Nuxt](https://vue-select-plus.github.io/vue-select-plus/vue/ssr)
- [Recipes](https://vue-select-plus.github.io/vue-select-plus/vue/recipes) — TanStack Query, VeeValidate, FormKit, Modal, Mobile
- [Troubleshooting](https://vue-select-plus.github.io/vue-select-plus/vue/troubleshooting)

## License

[MIT](./LICENSE) © Leon Mathey
