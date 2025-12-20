# Examples

<script setup>
import { VSelect } from '@vue-select-plus/vue'
import '@vue-select-plus/styles'

import { ref } from 'vue'

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date', disabled: true },
  { label: 'Elderberry', value: 'elderberry' }
]

const value1 = ref(null)
const value2 = ref(['apple', 'banana'])
const value3 = ref(null)
const value4 = ref(null)
const value5 = ref(null)
const value6 = ref(null)

const creatorOptions = ref([
  { 
    label: 'Backend', 
    value: 'be', 
    children: [
      { label: 'Node.js', value: 'node' }
    ] 
  },
  { 
    label: 'Frontend', 
    value: 'fe', 
    children: [
      { label: 'Vue.js', value: 'vue' }
    ] 
  }
])

function handleCreate({ parent, value }) {
  const parentOpt = creatorOptions.value.find(o => o.value === parent)
  if (parentOpt) {
      // Allow modifying readonly array for demo
      if (!parentOpt.children) parentOpt.children = []
      parentOpt.children.push({ label: value, value: value.toLowerCase() })
  }
}
</script>

## Basic Select


<div class="demo-box">
  <VSelect 
    v-model="value1" 
    :options="fruits" 
    label="Single Select"
    placeholder="Pick a fruit"
  />
  <p>Selected: {{ value1 }}</p>
</div>

```vue
<script setup>
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'
import '@vue-select-plus/styles'

const value = ref(null)
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' }
]
</script>

<template>
  <VSelect 
    v-model="value" 
    :options="options" 
    label="Single Select"
    placeholder="Pick a fruit"
  />
</template>
```

## Multi Select

<div class="demo-box">
  <VSelect 
    v-model="value2" 
    :options="fruits" 
    multiple
    label="Multi Select"
    placeholder="Pick many fruits"
  />
  <p>Selected: {{ value2 }}</p>
</div>

```vue
<script setup>
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'

const value = ref(['apple'])
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' }
]
</script>

<template>
  <VSelect 
    v-model="value" 
    :options="options" 
    multiple
    label="Multi Select" 
  />
</template>
```

## Searchable

<div class="demo-box">
  <VSelect 
    v-model="value3" 
    :options="fruits" 
    searchable
    label="Filter Fruits"
    placeholder="Type to search..."
  />
  <p>Selected: {{ value3 }}</p>
</div>

```vue
<script setup>
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'

const value = ref(null)
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' }
]
</script>

<template>
  <VSelect 
    v-model="value" 
    :options="options" 
    searchable
    label="Filter Fruits" 
  />
</template>
```

## Disabled & Error

<div class="demo-box">
  <div style="display: flex; gap: 20px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 200px;">
        <VSelect 
        :options="fruits" 
        disabled
        label="Disabled Prop"
        placeholder="Cannot select"
        />
    </div>
    <div style="flex: 1; min-width: 200px;">
        <VSelect 
        v-model="value4"
        :options="fruits" 
        error="This field is required"
        label="Error Prop"
        />
    </div>
  </div>
</div>

```vue
<template>
  <VSelect disabled label="Disabled" />
  
  <VSelect 
    error="Field required" 
    label="Error State" 
  />
</template>
```

## Custom Slots

<div class="demo-box">
  <VSelect 
    v-model="value5" 
    :options="fruits" 
    :item-height="60"
    label="Custom Option Slot"
  >
    <template #option="{ option }">
      <div class="custom-option">
        <span class="custom-icon">🍎</span>
        <div class="custom-details">
          <strong>{{ option.label }}</strong>
          <small>Value: {{ option.value }}</small>
        </div>
      </div>
    </template>
  </VSelect>
  <p>Selected: {{ value5 }}</p>
</div>

<style>
.custom-option {
  display: flex; 
  align-items: center; 
  gap: 8px;
}
.custom-details {
    display: flex; 
    flex-direction: column;
}
</style>

```vue
<template>
  <VSelect :options="fruits" :item-height="60" label="Custom Slot">
    <template #option="{ option }">
       <span class="my-option">
          <strong>{{ option.label }}</strong>
          <small>{{ option.value }}</small>
       </span>
    </template>
  </VSelect>
</template>
```

## Creator Mode

<div class="demo-box">
  <VSelect 
    v-model="value6" 
    :options="creatorOptions" 
    label="Add Child Items"
    placeholder="Select or Create..."
    @create="handleCreate"
  />
  <p>Selected: {{ value6 }}</p>
  <small>Click small '+' button on groups to add children.</small>
</div>

```vue
<script setup>
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'

const value = ref(null)
const options = ref([
  { 
    label: 'Backend', 
    value: 'be', 
    children: [
      { label: 'Node.js', value: 'node' }
    ] 
  },
  { 
    label: 'Frontend', 
    value: 'fe', 
    children: [
      { label: 'Vue.js', value: 'vue' }
    ] 
  }
])

function handleCreate({ parent, value }) {
  const group = options.value.find(o => o.value === parent)
  if (group) {
    if (!group.children) group.children = []
    group.children.push({ 
        label: value, 
        value: value.toLowerCase() 
    })
  }
}
</script>

<template>
  <VSelect 
    v-model="value" 
    :options="options" 
    @create="handleCreate" 
    label="Creator Mode" 
  />
</template>
```

## API Reference

For a full list of props and events, see the [API Reference](./api.md).

<style>
.demo-box {
  border: 1px solid var(--vp-c-divider);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 250px;
}
</style>
