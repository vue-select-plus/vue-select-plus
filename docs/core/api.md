# `@vue-select-plus/core` API Reference

The core package ships the headless engine behind `<VSelect>`. Use it to build a custom select UI while keeping selection, search, keyboard navigation, and tree flattening identical to the Vue component.

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

Only the four symbols above are part of the stable API. The individual composables (`useSelectState`, `useKeyboard`, `useOptions`, `useSelection`, `useCreator`) are internal — they may move or change shape between minor versions.

## `useSelect`

```ts
function useSelect(props: {
    options: Ref<ReadonlyArray<SelectOption>>;
    modelValue: Ref<SelectModelValue>;
    multiple: boolean;
    searchable: boolean;
    disabled: Ref<boolean>;
    filterable?: Ref<boolean>;
}): UseSelectReturn;
```

### Returned state

| Key | Type | Purpose |
| :--- | :--- | :--- |
| `isOpen` | `Ref<boolean>` | Whether the listbox is open. |
| `searchQuery` | `Ref<string>` | Current search input value. |
| `highlightedIndex` | `Ref<number>` | Index into `visibleOptions` of the active descendant. |
| `visibleOptions` | `ComputedRef<FlatOption[]>` | Flattened, filtered, collapse-aware list. |
| `navigableIndices` | `ComputedRef<number[]>` | Indices of options the keyboard can land on. |
| `collapsedValues` | `Ref<Set<SelectValue>>` | Tree nodes currently collapsed. |
| `creatorParentValue` | `Ref<SelectValue \| null>` | Parent value when creator mode is active. |
| `labelMap` | `ComputedRef<Map<SelectValue, string>>` | Flat value → label lookup (O(1)). |

### Returned actions

| Key | Type | Purpose |
| :--- | :--- | :--- |
| `open` / `close` / `toggle` | `() => void` | Listbox open-state. `open()` also highlights the selected option. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | Wire this to your trigger's `@keydown`. |
| `handleSelect` | `(opt: FlatOption) => void` | Apply a selection respecting `multiple`. |
| `isSelected` | `(value?: SelectValue) => boolean` | Selection predicate. |
| `removeValue` | `(value: SelectValue) => void` | Remove one value (multi). |
| `removeLast` | `() => void` | Pop the last selected value (multi). |
| `clear` | `() => void` | Reset the model. |
| `toggleCollapse` | `(value: SelectValue) => void` | Expand/collapse a tree node. |
| `setHighlight` | `(index: number) => void` | Move the active descendant. |
| `startCreator` / `cancelCreator` | `(value: SelectValue) => void` / `() => void` | Open/close the inline creator row. |

## `useClickOutside`

```ts
function useClickOutside(
    targets:
        | MaybeRef<HTMLElement | null>
        | MaybeRef<HTMLElement | null>[],
    handler: (event: PointerEvent | FocusEvent) => void
): void;
```

Attaches a capture-phase `pointerdown` listener that fires `handler` when the event target is **outside every target** in the array. Pass an array when your dropdown is teleported — include both the anchor and the floating menu so clicks on the menu don't count as "outside".

## Types

```ts
type SelectValue = string | number;

type SelectModelValue =
    | SelectValue
    | SelectValue[]
    | undefined
    | null;

interface SelectOption {
    value?: SelectValue;          // omit for group-only rows
    label: string;
    disabled?: boolean;
    children?: SelectOption[];    // tree
    group?: string;               // renders as a non-selectable header
}

interface FlatOption extends SelectOption {
    depth: number;
    isGroup: boolean;
    isCreator?: boolean;
    parentValue?: SelectValue;
    key: string | number;
}
```

## Minimal example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSelect, useClickOutside, type SelectOption } from '@vue-select-plus/core';

const options = ref<SelectOption[]>([
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' }
]);
const modelValue = ref<string | null>(null);
const disabled = ref(false);

const {
    isOpen, visibleOptions, highlightedIndex,
    open, toggle, close, onKeyDown,
    handleSelect, isSelected
} = useSelect({
    options,
    modelValue,
    multiple: false,
    searchable: false,
    disabled
});

const rootRef = ref<HTMLElement | null>(null);
useClickOutside(rootRef, close);
</script>

<template>
    <div ref="rootRef" @keydown="onKeyDown">
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

This skips ARIA polish like `aria-activedescendant`, virtualisation, and tag rendering — those are exactly what `<VSelect>` adds on top.
