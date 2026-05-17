# @vue-select-plus/core

[![npm version](https://img.shields.io/npm/v/@vue-select-plus/core?style=flat-square&color=41d1ff)](https://www.npmjs.com/package/@vue-select-plus/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@vue-select-plus/core?label=gzipped&style=flat-square)](https://bundlephobia.com/package/@vue-select-plus/core)

The headless engine behind Vue Select Plus: selection state, search,
keyboard navigation, tree flattening, virtualisation-friendly option lists.
No UI.

Docs: <https://vue-select-plus.github.io/vue-select-plus/core/getting-started>

If you just want a working `<VSelect>`, use
[`@vue-select-plus/vue`](https://www.npmjs.com/package/@vue-select-plus/vue).
Reach for this package when you need your own markup — exotic UI, a custom
virtualiser, or selection state for something that isn't a dropdown
(multi-toggle list, command palette, etc.).

## Install

```bash
npm install @vue-select-plus/core
```

Requires **Vue 3.5+**. This package has no dependencies other than Vue.

## Public API

```ts
import {
    useSelect,
    useClickOutside,
    type SelectOption,
    type SelectModelValue,
    type SelectValue,
    type FlatOption
} from '@vue-select-plus/core';
```

That's the entire stable surface. Internal composables (`useKeyboard`, `useOptions`, `useSelection`, `useSelectState`, `useCreator`) are part of the implementation and may move between minors.

## Quickstart

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSelect, type SelectOption } from '@vue-select-plus/core';

const options = ref<SelectOption[]>([
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' }
]);
const modelValue = ref<string | null>(null);

const {
    isOpen, visibleOptions, highlightedIndex,
    toggle, onKeyDown, handleSelect, isSelected
} = useSelect({
    options,
    modelValue,
    multiple: false,
    searchable: false,
    disabled: ref(false)
});
</script>

<template>
    <div @keydown="onKeyDown">
        <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            @click="toggle"
        >
            {{ modelValue ?? 'Pick…' }}
        </button>

        <ul v-if="isOpen" role="listbox">
            <li
                v-for="(opt, i) in visibleOptions"
                :key="opt.key"
                role="option"
                :aria-selected="isSelected(opt.value)"
                :class="{ active: i === highlightedIndex }"
                @click="handleSelect(opt)"
            >
                {{ opt.label }}
            </li>
        </ul>
    </div>
</template>
```

For a fully wired-up reference (ARIA `activedescendant`, virtualisation, tag rendering, hidden form inputs, Floating-UI positioning) see [`packages/vue`](https://github.com/vue-select-plus/vue-select-plus/tree/main/packages/vue) in the source tree.

## Docs

- [Getting Started](https://vue-select-plus.github.io/vue-select-plus/core/getting-started)
- [API Reference](https://vue-select-plus.github.io/vue-select-plus/core/api) — every return value of `useSelect` documented

## License

[MIT](./LICENSE) © Leon Mathey
