# SSR / Nuxt

`<VSelect>` is server-rendered without special configuration. The IDs come from Vue 3.5's `useId()`, so there are no hydration mismatches; Floating UI only positions client-side; the listbox only renders when opened.

## Nuxt 3

### Install

```bash
npm install @vue-select-plus/vue @vue-select-plus/styles
```

### Register globally

```ts
// plugins/vue-select-plus.ts
import { VSelect } from '@vue-select-plus/vue';

export default defineNuxtPlugin((nuxt) => {
    nuxt.vueApp.component('VSelect', VSelect);
});
```

### Import the stylesheet

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    css: ['@vue-select-plus/vue/styles.css']
});
```

### Use anywhere

```vue
<script setup lang="ts">
import type { SelectOption } from '@vue-select-plus/vue';

const value = ref<string | null>(null);
const options: SelectOption[] = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' }
];
</script>

<template>
    <VSelect v-model="value" :options label="Pick one" clearable />
</template>
```

No auto-import config needed — `VSelect` is registered as a global component above. If you'd rather auto-import, use `components.dirs` and re-export from your own components folder.

## Teleport and SSR

By default the listbox teleports to `<body>` when opened. **On the server, `<body>` doesn't exist yet — Vue handles this gracefully and renders nothing for the menu** (the menu only opens client-side anyway). No special handling required.

If you render the component server-side and the user has JavaScript disabled, the trigger + label + selected-value summary are still rendered as HTML and the form value is serialized via the hidden inputs. The dropdown won't be openable, but the data is on the page.

## Astro

```astro
---
import { VSelect } from '@vue-select-plus/vue';
import '@vue-select-plus/vue/styles.css';
---

<VSelect client:load options={fruits} label="Fruit" />
```

Use `client:load` (or `client:visible` for below-the-fold instances) — the component needs JS for the interactive parts. Server-rendered shell is the same as Nuxt.

## Hydration tips

- **IDs are deterministic per app.** Different `<VSelect>` instances on the same page get different ids derived from Vue's `useId()`. Across page reloads the ids may differ, but they always match between server and client renders of the same instance — that's what matters for hydration.
- **Don't pass a random `id` prop** like `:id="Math.random()"` — that defeats the purpose. Either omit `id` entirely (the component generates a stable one) or use a meaningful slug.
- **`teleport: 'body'`** (the default) requires no setup. If you teleport into a custom container (e.g. a modal), make sure that container exists before the menu opens — pass a ref via `:teleport="modalRef"`.

## Testing under SSR

We ship SSR smoke tests that call `renderToString()` on every important configuration (single, multi, searchable, required+error, hidden form inputs). If you're building a wrapper component, mirror that pattern:

```ts
import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import MyWrapper from './MyWrapper.vue';

const html = await renderToString(createSSRApp(MyWrapper));
expect(html).toContain('role="combobox"');
```

## Known SSR caveats

- **`prefers-color-scheme` is a client-side media query.** During SSR we don't know which theme the user prefers; the rendered HTML uses the default (light) theme. The dark theme kicks in after hydration once the browser evaluates the media query. To avoid a brief light-mode flash, set the `dark` or `vsp-dark` class on `<html>` server-side based on a cookie or `prefers-color-scheme` headers.
- **`forced-colors` is also client-side**. Same advice.
- **`@floating-ui/vue`'s `autoUpdate` attaches listeners on mount.** If you SSR-render with `:loading="true"` and `isOpen` were ever true server-side (it isn't by default), Floating UI would error. Don't force `isOpen: true` via a `defineModel` workaround during SSR.
