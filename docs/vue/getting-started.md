# Getting Started

## Install

```bash
npm install @vue-select-plus/vue @vue-select-plus/styles
```

The Vue package depends transitively on `@vue-select-plus/core`, `@floating-ui/vue` and `@tanstack/vue-virtual` — npm pulls them in automatically.

> **Peer requirement:** Vue 3.5 or newer (the component uses `useId()` for SSR-safe ids).

## Mount the styles

Import the stylesheet once, anywhere in your app's entry. Tree-shakers won't drop it because it's CSS.

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import '@vue-select-plus/styles';

createApp(App).mount('#app');
```

If you'd rather ship your own theme, skip this import and override the [CSS variables](./api#css-variables).

## Hello, select

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VSelect } from '@vue-select-plus/vue';
import type { SelectOption } from '@vue-select-plus/core';

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
        clearable
    />
</template>
```

## What you get out of the box

- **WAI-ARIA 1.2 combobox** — proper roles, labels, and live regions.
- **Full keyboard support** — arrow keys, type-ahead, Home/End, PageUp/Down, tree navigation.
- **Virtualized rendering** — handles 100k+ options without lag.
- **Floating UI positioning** — auto-flip, viewport shifting, teleport to `<body>` by default.
- **Native form integration** — pass a `name` prop and the value submits like any `<select>`.
- **SSR-safe** — Nuxt / Astro / Vapor work out of the box.
- **`prefers-reduced-motion`** and **Windows High Contrast** baked in.

## Next steps

- [Examples](./examples.md) — multi-select, async search, tree, creator mode, native forms.
- [API reference](./api.md) — every prop, event, slot, exposed method, and ARIA detail.
- [Headless core](../core/getting-started.md) — build your own UI on top of the composables.
