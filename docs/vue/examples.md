# Examples

<script setup>
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'
import '@vue-select-plus/styles'

const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true },
    { value: 'elderberry', label: 'Elderberry' }
]

const single = ref(null)
const multi = ref(['apple', 'banana'])
const search = ref(null)
const tree = ref(['vue'])
const clearable = ref('cherry')
const requiredValue = ref(null)
const longValue = ref(null)

const techStack = [
    {
        label: 'Frontend', value: 'fe', children: [
            { label: 'Vue', value: 'vue' },
            { label: 'React', value: 'react' },
            { label: 'Svelte', value: 'svelte' }
        ]
    },
    {
        label: 'Backend', value: 'be', children: [
            { label: 'Node.js', value: 'node', children: [
                { label: 'Express', value: 'express' },
                { label: 'NestJS', value: 'nest' }
            ]},
            { label: 'Go', value: 'go' }
        ]
    }
]

const longList = Array.from({ length: 5000 }, (_, i) => ({
    value: `item-${i}`,
    label: `Item ${String(i + 1).padStart(4, '0')}`
}))

// Async demo
const allUsers = Array.from({ length: 200 }, (_, i) => ({
    value: `u-${i}`,
    label: `${['Alice', 'Bob', 'Carol', 'Dan'][i % 4]} #${i}`
}))
const asyncOptions = ref([])
const asyncLoading = ref(false)
const asyncValue = ref(null)
let asyncToken = 0

async function onAsyncSearch(query) {
    const my = ++asyncToken
    if (!query) {
        asyncOptions.value = []
        return
    }
    asyncLoading.value = true
    await new Promise(r => setTimeout(r, 300))
    if (my !== asyncToken) return
    const q = query.toLowerCase()
    asyncOptions.value = allUsers.filter(u => u.label.toLowerCase().includes(q)).slice(0, 30)
    asyncLoading.value = false
}

// Creator demo
//
// Note: we use `ref(...)` + a whole-array swap on every create. With
// `reactive(...)` and in-place mutation, VitePress' SSR + hydration boundary
// occasionally drops nested reactivity inside markdown <script setup> blocks.
// The ref-and-replace pattern is bulletproof.
const creatorOptions = ref(JSON.parse(JSON.stringify(techStack)))
const creatorValue = ref(null)
function handleCreate({ parent, value }) {
    const next = JSON.parse(JSON.stringify(creatorOptions.value))
    const add = (opts) => {
        for (const opt of opts) {
            if (opt.value === parent) {
                if (!opt.children) opt.children = []
                opt.children.push({ label: value, value: value.toLowerCase() })
                return true
            }
            if (opt.children && add(opt.children)) return true
        }
        return false
    }
    add(next)
    creatorOptions.value = next
}

// Native form demo
const formValue = ref(['vue'])
const formOutput = ref('')
function onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    formOutput.value = JSON.stringify(Object.fromEntries(
        Array.from(data.keys()).map(k => [k, data.getAll(k)])
    ), null, 2)
}
</script>

## Single select

<div class="demo-box">
    <VSelect v-model="single" :options="fruits" label="Pick a fruit" placeholder="Choose…" clearable />
    <p class="muted">Selected: <code>{{ single ?? 'null' }}</code></p>
</div>

```vue
<VSelect
    v-model="fruit"
    :options="fruits"
    label="Pick a fruit"
    placeholder="Choose…"
    clearable
/>
```

## Multi select with tags

<div class="demo-box">
    <VSelect v-model="multi" :options="fruits" label="Favorites" multiple clearable />
    <p class="muted">Selected: <code>{{ JSON.stringify(multi) }}</code></p>
</div>

```vue
<VSelect v-model="favorites" :options="fruits" label="Favorites" multiple clearable />
```

Tag-remove buttons are reachable via <kbd>Tab</kbd> and labelled "Remove {item}". <kbd>Backspace</kbd> in an empty search input removes the last tag.

## Searchable (client-side)

<div class="demo-box">
    <VSelect v-model="search" :options="fruits" label="Filter" placeholder="Type to filter…" searchable clearable />
</div>

```vue
<VSelect v-model="value" :options="options" searchable placeholder="Type to filter…" />
```

## Async / server-side search

<div class="demo-box">
    <VSelect
        v-model="asyncValue"
        :options="asyncOptions"
        :loading="asyncLoading"
        :filterable="false"
        :min-search-length="2"
        :search-debounce="300"
        label="Find a user"
        placeholder="Type at least 2 chars…"
        searchable
        @search="onAsyncSearch"
    />
    <p class="muted small">Search is debounced 300 ms and gated to 2 characters. <code>aria-busy</code> flips while loading.</p>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '@vue-select-plus/vue'

const value = ref<string | null>(null)
const options = ref<SelectOption[]>([])
const loading = ref(false)

let token = 0
async function onSearch(query: string) {
    const my = ++token
    if (!query) { options.value = []; return }
    loading.value = true
    const data = await fetch(`/api/users?q=${encodeURIComponent(query)}`).then(r => r.json())
    if (my !== token) return    // race-guard: ignore stale responses
    options.value = data.map(u => ({ value: u.id, label: u.name }))
    loading.value = false
}
</script>

<template>
    <VSelect
        v-model="value"
        :options="options"
        :loading="loading"
        :filterable="false"
        :min-search-length="2"
        :search-debounce="300"
        searchable
        @search="onSearch"
    />
</template>
```

## Nested tree

<div class="demo-box">
    <VSelect v-model="tree" :options="techStack" label="Tech stack" multiple searchable />
    <p class="muted">Selected: <code>{{ JSON.stringify(tree) }}</code></p>
</div>

Use <kbd>→</kbd>/<kbd>←</kbd> to expand/collapse, or jump to a parent.

```vue
<VSelect v-model="stack" :options="techStack" multiple searchable label="Tech stack" />
```

```ts
const techStack = [
    {
        label: 'Frontend', value: 'fe',
        children: [
            { label: 'Vue', value: 'vue' },
            { label: 'React', value: 'react' }
        ]
    },
    {
        label: 'Backend', value: 'be',
        children: [
            { label: 'Node.js', value: 'node', children: [...] },
            { label: 'Go', value: 'go' }
        ]
    }
]
```

## Creator mode

<div class="demo-box">
    <VSelect
        v-model="creatorValue"
        :options="creatorOptions"
        label="Add child"
        placeholder="Hover a group, hit +"
        creatable
        @create="handleCreate"
    />
    <p class="muted small">Hover any group with children — a <kbd>+</kbd> button appears.</p>
</div>

```vue
<VSelect v-model="value" :options="options" creatable @create="handleCreate" />
```

The `+` handles only render when `creatable` is set. Listening to
`@create` alone isn't enough — the prop is the explicit opt-in.

```ts
function handleCreate({ parent, value }: { parent: string | number; value: string }) {
    // mutate your tree however you like — push to children, call an API, etc.
}
```

## Validation + error state

<div class="demo-box">
    <VSelect
        v-model="requiredValue"
        :options="fruits"
        label="Required field"
        required
        :error="requiredValue ? '' : 'Please pick a fruit.'"
    />
</div>

```vue
<VSelect
    v-model="value"
    :options="options"
    required
    :error="value ? '' : 'Please pick a fruit.'"
/>
```

The combobox reports `aria-invalid="true"` and links to the visible message via `aria-describedby`.

## Native form integration

<div class="demo-box">
    <form @submit="onSubmit">
        <VSelect v-model="formValue" :options="techStack" label="Stack" name="stack" multiple />
        <button type="submit" style="margin-top: 0.75rem; padding: 0.5rem 1rem;">Submit</button>
    </form>
    <pre v-if="formOutput">{{ formOutput }}</pre>
    <p v-else class="muted small">Submit to see the serialized form data.</p>
</div>

```vue
<form @submit="onSubmit">
    <VSelect v-model="stack" :options="techStack" name="stack" multiple />
    <button type="submit">Submit</button>
</form>
```

```ts
function onSubmit(e: Event) {
    e.preventDefault()
    const data = new FormData(e.target as HTMLFormElement)
    console.log(data.getAll('stack'))   // ['vue', 'go']
}
```

When `name` is set, the component emits hidden `<input>`s — one per selected value in multi mode — so the form serializes exactly like a native `<select>`.

## Virtualized list (5 000 items)

<div class="demo-box">
    <VSelect v-model="longValue" :options="longList" label="Long list" searchable />
</div>

```vue
<VSelect v-model="value" :options="hugeList" searchable />
```

The dropdown only mounts the rows currently in view — performance stays flat regardless of list size.

## Theming

```css
:root {
    --vs-primary: #16a34a;
    --vs-radius: 12px;
}
:root.dark {
    --vs-primary: #4ade80;
}
```

See the [CSS variables reference](./api#css-variables) for the full list.

<style>
.demo-box {
    border: 1px solid var(--vp-c-divider);
    padding: 1.25rem;
    border-radius: 8px;
    margin-block: 1rem;
}
.demo-box pre {
    margin-block-start: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    overflow-x: auto;
    background: rgba(0,0,0,0.04);
}
.muted { color: var(--vp-c-text-2); }
.small { font-size: 0.85rem; }
kbd {
    display: inline-block;
    padding: 0 0.25rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    font-size: 0.75rem;
}
</style>
