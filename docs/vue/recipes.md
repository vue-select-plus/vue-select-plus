# Recipes

Integration patterns. Each one is self-contained — copy, paste, adapt.

[[toc]]

## Async search with TanStack Query

Pair `@vue-select-plus/vue` with [`@tanstack/vue-query`](https://tanstack.com/query/latest/docs/vue/overview)
for cached, cancellation-safe server search.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import { VSelect, type SelectOption } from '@vue-select-plus/vue';

const query = ref('');
const value = ref<string | null>(null);

const { data, isFetching } = useQuery({
    queryKey: ['users', query],
    queryFn: ({ signal }) =>
        fetch(`/api/users?q=${encodeURIComponent(query.value)}`, { signal })
            .then((r) => r.json()),
    enabled: computed(() => query.value.length >= 2),
    placeholderData: keepPreviousData,
    staleTime: 30_000
});

const options = computed<SelectOption[]>(() =>
    (data.value ?? []).map((u: { id: string; name: string }) => ({
        value: u.id,
        label: u.name
    }))
);
</script>

<template>
    <VSelect
        v-model="value"
        :options="options"
        :loading="isFetching"
        :filterable="false"
        :min-search-length="2"
        :search-debounce="250"
        label="Assignee"
        placeholder="Type at least 2 chars…"
        searchable
        clearable
        @search="(q) => (query = q)"
    />
</template>
```

Notes:
- TanStack passes a `signal` into your fetcher, so stale requests get
  cancelled automatically.
- `keepPreviousData` stops the dropdown from flashing empty during the
  next fetch.
- `staleTime` of 30 s dedupes repeat queries within the window.

---

## VeeValidate

[VeeValidate](https://vee-validate.logaretm.com/) treats the model just like any other field. Disable our built-in HTML5 validation so the libraries don't fight:

```vue
<script setup lang="ts">
import { useField } from 'vee-validate';
import { VSelect } from '@vue-select-plus/vue';

const { value, errorMessage, handleBlur } = useField<string | null>('fruit', (v) =>
    v ? true : 'Please pick a fruit'
);
</script>

<template>
    <VSelect
        v-model="value"
        :options="fruits"
        label="Fruit"
        :error="errorMessage"
        :validate-on-submit="false"
        required
        @close="handleBlur"
    />
</template>
```

The component still:
- Sets `aria-invalid="true"` and `aria-required="true"` from the props.
- Renders the visible error message and links it via `aria-describedby`.

It just won't block the native form submit — VeeValidate handles that.

---

## FormKit

[FormKit](https://formkit.com/) works the same way: wrap `<VSelect>` in a custom input or use it via `FormKit.props.attrs`.

```vue
<script setup lang="ts">
import { FormKit } from '@formkit/vue';
import { VSelect } from '@vue-select-plus/vue';
</script>

<template>
    <FormKit
        type="text"
        name="fruit"
        :validation="[['required']]"
        validation-visibility="submit"
        v-slot="{ node, value }"
    >
        <VSelect
            :model-value="value"
            @update:model-value="(v) => node.input(v)"
            :options="fruits"
            :error="node.context?.messages?.rule_required?.value"
            :validate-on-submit="false"
            label="Fruit"
            required
        />
    </FormKit>
</template>
```

For tighter integration, wrap `<VSelect>` in a [FormKit custom input](https://formkit.com/essentials/custom-inputs).
Validation, errors, value, and submit handling then flow through FormKit
the normal way.

---

## Inside a Modal

`<VSelect>` teleports to `<body>` by default, so it floats above most
modals fine. The exception is a native `<dialog>.showModal()` — the
dialog renders in the browser's top layer, and the body is behind it.

Two patterns:

### Pattern A — teleport into the dialog

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { VSelect } from '@vue-select-plus/vue';

const dialogRef = ref<HTMLDialogElement | null>(null);

function openDialog() {
    dialogRef.value?.showModal();
}
</script>

<template>
    <button @click="openDialog">Open</button>

    <dialog ref="dialogRef">
        <VSelect
            v-model="value"
            :options="options"
            :teleport="dialogRef"
            label="Pick one"
        />
    </dialog>
</template>
```

### Pattern B — render inline

```vue
<VSelect :teleport="false" ... />
```

Use this when the modal already handles layering and you want the
dropdown in the same DOM subtree. Be aware that `overflow: hidden` on
any ancestor will clip the menu.

---

## Inside a Table cell

Sticky headers and `overflow-x: auto` typically clip dropdowns. The
defaults already solve that — teleport to body, Floating UI's `shift`
middleware, and a small size variant:

```vue
<td>
    <VSelect v-model="row.status" :options="statuses" :item-height="32" size="sm" />
</td>
```

---

## Mobile-friendly setup

On touch devices:

- Set `searchable: false` — typing on mobile is friction.
- Teleport into a bottom-sheet rather than `<body>` when using one.
- Use `size="lg"` for bigger touch targets.

```vue
<VSelect
    v-model="value"
    :options="options"
    size="lg"
    label="Country"
    placeholder="Tap to choose"
/>
```

If you do enable `searchable`, set `inputmode="search"` so iOS shows a "Search" key. For numeric values:

```vue
<VSelect searchable inputmode="numeric" ... />
```

---

## Object values (workaround until generics land)

`SelectModelValue` is `string | number | …`. To bind to objects, store an id in the model and look the object up locally:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { VSelect, type SelectOption } from '@vue-select-plus/vue';

interface User { id: string; name: string; email: string }
const users: User[] = [
    { id: '1', name: 'Alice', email: 'a@x' },
    { id: '2', name: 'Bob', email: 'b@x' }
];

const selectedId = ref<string | null>(null);
const selected = computed(() => users.find((u) => u.id === selectedId.value));

const options = computed<SelectOption[]>(() =>
    users.map((u) => ({ value: u.id, label: u.name }))
);
</script>

<template>
    <VSelect v-model="selectedId" :options="options" label="User" />
    <p v-if="selected">Email: {{ selected.email }}</p>
</template>
```

A future major will add generic `<TValue>` support; until then, this
indirection is the recommended pattern.

---

## Two-step Backspace (confirm-before-remove)

The default Backspace shortcut removes the last tag immediately. For high-risk forms, gate it behind a confirmation by intercepting the `update:modelValue` event:

```vue
<script setup lang="ts">
const pendingRemoval = ref<string | number | null>(null);
const value = ref<string[]>(['apple', 'banana']);

function handleUpdate(next: string[]) {
    if (next.length < value.value.length && pendingRemoval.value === null) {
        const removed = value.value.find((v) => !next.includes(v))!;
        pendingRemoval.value = removed;
        // Re-confirm: revert for now
        return;
    }
    pendingRemoval.value = null;
    value.value = next;
}
</script>

<template>
    <VSelect
        :model-value="value"
        @update:model-value="handleUpdate"
        :options="fruits"
        multiple
    />
    <p v-if="pendingRemoval">
        Press Backspace again to remove "{{ pendingRemoval }}",
        or any other key to cancel.
    </p>
</template>
```

---

## Custom keyboard shortcuts

Use a template ref to drive the component imperatively:

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VSelect } from '@vue-select-plus/vue';

const selectRef = ref<InstanceType<typeof VSelect> | null>(null);

function onKey(e: KeyboardEvent) {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        selectRef.value?.open();
        selectRef.value?.focus();
    }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
    <VSelect ref="selectRef" v-model="value" :options="options" searchable />
</template>
```

The exposed methods are `open`, `close`, `focus`, and `clear`.

---

## Theming with CSS-in-JS

If your design system uses CSS-in-JS (e.g. Vanilla Extract, Stitches, Pigment), override the variables on a wrapper:

```vue
<div :style="{ '--vs-primary': brand.primary, '--vs-radius': '12px' }">
    <VSelect ... />
</div>
```

Variables cascade naturally — no shadow DOM, no extra selector indirection.

---

## Restoring the selected value when options arrive late

If your options are fetched asynchronously and the `v-model` is hydrated from the server with just an id, the trigger shows the raw id until the options arrive. Two fixes:

**1. Use the `value` slot** to render whatever you have on hand:

```vue
<VSelect v-model="userId" :options="users">
    <template #value="{ value, label }">
        <span>{{ label ?? `Loading ${value}…` }}</span>
    </template>
</VSelect>
```

**2. Pre-seed `options` with the selected entry** while fetching:

```ts
const options = computed(() => {
    const fetched = data.value ?? [];
    if (selectedUser.value && !fetched.some((u) => u.id === selectedUser.value!.id)) {
        return [selectedUser.value, ...fetched];
    }
    return fetched;
});
```
