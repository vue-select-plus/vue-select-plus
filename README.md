# Vue Select Plus

![NPM Version](https://img.shields.io/npm/v/@vue-select-plus/vue?style=flat-square&color=41d1ff)
![Build Status](https://img.shields.io/github/actions/workflow/status/vue-select-plus/vue-select-plus/deploy.yml?style=flat-square&label=docs)
![License](https://img.shields.io/github/license/vue-select-plus/vue-select-plus?style=flat-square&color=blue)
![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-3178C6?style=flat-square)

Documentation: <https://vue-select-plus.github.io/vue-select-plus/>

An accessible, headless select component for Vue 3.

## Features

- WAI-ARIA 1.2 combobox pattern with full keyboard support.
- Tree-aware (infinite nesting, expand/collapse navigation).
- Client filtering, or server-side via `@search` + `:filterable="false"`.
- Multi-select with keyboard-reachable tags.
- Floating UI for positioning (auto-flip, teleport, sticky width).
- Native form submission via hidden `<input>`.
- Themeable via CSS variables, including dark mode, `forced-colors`,
  and `prefers-reduced-motion`.
- Virtualised list — usable with 100k+ options.
- Headless core (`@vue-select-plus/core`) exposes the logic without the UI.

## Install

```bash
npm install @vue-select-plus/vue
```

Requires Vue 3.5 or newer. The default stylesheet ships inside the vue
package, so a single install is enough.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VSelect } from '@vue-select-plus/vue';
import type { SelectOption } from '@vue-select-plus/core';
import '@vue-select-plus/vue/styles.css';

const value = ref<string | null>(null);
const options: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    {
        value: 'tropical',
        label: 'Tropical',
        children: [
            { value: 'mango', label: 'Mango' },
            { value: 'pineapple', label: 'Pineapple' }
        ]
    }
];
</script>

<template>
    <VSelect
        v-model="value"
        :options="options"
        label="Choose a fruit"
        placeholder="Pick one…"
        searchable
        clearable
    />
</template>
```

## Packages

| Package | What it is |
| :--- | :--- |
| [`@vue-select-plus/vue`](https://www.npmjs.com/package/@vue-select-plus/vue) | The Vue 3 component (`<VSelect>`). |
| [`@vue-select-plus/core`](https://www.npmjs.com/package/@vue-select-plus/core) | Headless composables (`useSelect`, `useClickOutside`). |
| [`@vue-select-plus/styles`](https://www.npmjs.com/package/@vue-select-plus/styles) | Default theme. Optional — override the CSS variables to roll your own. |

## Docs

- [Getting Started](https://vue-select-plus.github.io/vue-select-plus/vue/getting-started)
- [Examples](https://vue-select-plus.github.io/vue-select-plus/vue/examples) — async search, native forms, creator mode, trees
- [API Reference](https://vue-select-plus.github.io/vue-select-plus/vue/api) — every prop, event, slot, ARIA detail
- [Headless Core](https://vue-select-plus.github.io/vue-select-plus/core/getting-started)

## Accessibility

`<VSelect>` ships the [WAI-ARIA 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) end-to-end:

- Roles: `combobox` on the focusable element, `listbox` on the popup, `option` on each row.
- States: `aria-expanded`, `aria-activedescendant`, `aria-selected`, `aria-multiselectable`, `aria-busy`, `aria-invalid`, `aria-required`.
- Tree semantics: `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`.
- A polite live region announces result counts, loading, and below-min-search hints.
- Tag-remove and clear buttons are reachable via Tab and labelled.
- Focus returns to the trigger on `Escape` / selection.
- `prefers-reduced-motion` and `forced-colors` (Windows High Contrast) are honoured.

## Contributing

```bash
git clone https://github.com/vue-select-plus/vue-select-plus
cd vue-select-plus
npm install
npm test        # runs all workspaces
npm run build
```

Interactive sandboxes:

```bash
npm run dev -w @vue-select-plus/playground     # local playground (all features)
npm run storybook -w @vue-select-plus/vue      # Storybook (per-story a11y checks)
npm run docs:build                              # build the docs site
```

## License

[MIT](./LICENSE).
