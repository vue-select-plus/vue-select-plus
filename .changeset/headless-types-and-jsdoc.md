---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

`multiple` and `searchable` on `useSelect` are now `MaybeRefOrGetter<boolean>`
to match the other props. Plain values keep working; refs and computeds
now also do, so headless consumers can flip single ↔ multi at runtime.

The `collapsedValues` ref is annotated explicitly as
`Ref<Set<SelectValue>>` — TypeScript was inferring the longer
`Ref<Set<SelectValue> & Omit<Set<SelectValue>, …>>` from `ref(new Set())`
and showing it that way in IDE tooltips.

Emit signatures migrated to Vue 3.3+ tuple syntax. Note that the
generated `.d.ts` still widens handler return types to `any` — that's
Vue's `DefineComponent` machinery, not the declaration syntax, and
the argument types are correct either way.

JSDoc coverage extended to every default-carrying prop, every emit,
the four imperative methods on `defineExpose`, the `VSelectLabels`
keys, every `useSelect` return value, `useClickOutside`, and the core
type aliases. Pure docs — bundle size unchanged.
