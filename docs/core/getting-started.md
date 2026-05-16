# Getting Started

`@vue-select-plus/core` is the headless engine. Install it when you want the state machine — selection, search, keyboard navigation, tree flattening — but plan to render your own UI from scratch.

If you just want a ready-made select, use [`@vue-select-plus/vue`](../vue/getting-started.md) instead.

## Install

```bash
npm install @vue-select-plus/core
```

Requires Vue 3.5+.

## Minimal usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSelect, type SelectOption } from '@vue-select-plus/core';

const options = ref<SelectOption[]>([
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' }
]);
const modelValue = ref<string | null>(null);

const { isOpen, toggle, visibleOptions, handleSelect, isSelected } = useSelect({
    options,
    modelValue,
    multiple: false,
    searchable: false,
    disabled: ref(false)
});
</script>

<template>
    <button @click="toggle">{{ isOpen ? 'Close' : 'Open' }}</button>

    <ul v-if="isOpen">
        <li
            v-for="opt in visibleOptions"
            :key="opt.key"
            :aria-selected="isSelected(opt.value)"
            @click="handleSelect(opt)"
        >
            {{ opt.label }}
        </li>
    </ul>
</template>
```

## When to use core vs the Vue component

| You want… | Use |
| :--- | :--- |
| A complete, accessible select component | [`@vue-select-plus/vue`](../vue/getting-started.md) |
| Full markup control, custom virtualization, exotic UI | `@vue-select-plus/core` |
| Selection state for a non-dropdown UI (e.g. multi-toggle list) | `@vue-select-plus/core` |

See the [core API reference](./api.md) for every public symbol.
