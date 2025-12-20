# Vue Select Plus

📘 **Documentation**: [Read the Docs](./docs/index.md)

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
npm install vue-select-plus
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { VSelect } from 'vue-select-plus';
import 'vue-select-plus/dist/style.css'; // If you have styles

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
