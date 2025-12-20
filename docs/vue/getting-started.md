# Getting Started

## Installation

```bash
npm install @vue-select-plus/vue

```

## Setup

Imports styles and the component.

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import '@vue-select-plus/styles' // Import default styles

createApp(App).mount('#app')
```

## Basic Usage

```vue
<script setup>
import { ref } from 'vue'
import VSelect from '@/components/VSelect.vue'

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
]

const selected = ref(null)
</script>

<template>
  <VSelect 
    v-model="selected" 
    :options="fruits" 
    label="Choose a fruit" 
    placeholder="Select..."
  />
</template>
```
