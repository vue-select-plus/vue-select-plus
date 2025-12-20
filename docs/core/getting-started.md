# Getting Started

## Installation

```bash
npm install @vue-select-plus/core
```

## Usage

The Core package provides headless composables for building your own Select component.

```vue
<script setup>
import { useSelect } from '@vue-select-plus/core'

const { isOpen, toggle } = useSelect()
</script>

<template>
  <div @click="toggle">
    Select is {{ isOpen ? 'Open' : 'Closed' }}
  </div>
</template>
```
