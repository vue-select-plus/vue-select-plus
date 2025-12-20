# Vue Select Plus

![NPM Version](https://img.shields.io/npm/v/@vue-select-plus/vue?style=flat-square&color=41d1ff)
![Build Status](https://img.shields.io/github/actions/workflow/status/vue-select-plus/vue-select-plus/deploy.yml?layout=flat-square&label=docs)
![License](https://img.shields.io/github/license/vue-select-plus/vue-select-plus?style=flat-square&color=blue)
![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-3178C6?style=flat-square)

📘 **Documentation**: [https://vue-select-plus.github.io/vue-select-plus/](https://vue-select-plus.github.io/vue-select-plus/)

> A headless, flexible, and accessible select component for Vue 3.

## Features
- 🌲 **Tree Support**: Hierarchical data with infinite nesting.
- 🔍 **Searchable**: Filter options easily.
- 🏷️ **Multiple Selection**: Tag-based selection.
- ➕ **Creator Mode**: Add new items on the fly (nested or top-level).
- ⌨️ **Keyboard Navigation**: Full arrow key support.
- ♿ **Accessible**: ARIA attributes and roles.

## Installation

```bash
npm install @vue-select-plus/vue
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { VSelect } from '@vue-select-plus/vue';
import '@vue-select-plus/styles';


const value = ref(null);
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2', children: [
    { value: '2.1', label: 'Sub-option 2.1' }
  ]}
];
</script>

<template>
  <VSelect 
    v-model="value" 
    :options="options" 
    placeholder="Choose..." 
    searchable 
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string | number | Array` | - | The selected value(s). |
| `options` | `Array` | `[]` | List of options (see structure below). |
| `multiple` | `Boolean` | `false` | Enable multiple selection. |
| `searchable` | `Boolean` | `false` | Show search input. |
| `disabled` | `Boolean` | `false` | Disable the control. |
| `id` | `String` | `auto-generated` | Unique ID for the component. |

## Events

- `update:modelValue`: Emitted when selection changes.
- `create`: Emitted when a new item is created in Creator Mode.

## Option Structure

```ts
interface SelectOption {
    value?: string | number;
    label: string;
    children?: SelectOption[];
    // ... any other props
}
```
