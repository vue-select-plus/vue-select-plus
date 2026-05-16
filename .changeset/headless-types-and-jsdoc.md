---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

Headless DX: type consistency, cleaner tooltips, JSDoc on the whole public API.

- **`useSelect` props are now consistent.** `multiple` and `searchable` were
  typed as plain `boolean` while `disabled`, `filterable`, `options` used
  `Ref` / `MaybeRefOrGetter`. They're now all `MaybeRefOrGetter` — headless
  consumers can bind any of them to a ref or computed and toggle single ↔
  multi (or searchable on/off) at runtime. Backward compatible: plain
  values still accepted.
- **Cleaner `collapsedValues` type display.** The IDE used to show
  `Ref<Set<SelectValue> & Omit<Set<SelectValue>, …>>` in tooltips, courtesy
  of TypeScript's inference for `ref(new Set())`. Now annotated explicitly
  as `Ref<Set<SelectValue>>`.
- **Vue 3.3+ tuple emit syntax.** `<VSelect>` and `<VSelectOption>` migrated
  to the modern emit declaration form. (Note: Vue's generated `.d.ts` still
  reports handler return types as `any` regardless of declaration style —
  that's a framework decision. Argument types are correctly typed.)
- **JSDoc on the entire public API.** Previous releases had JSDoc on props
  with defaults. This release adds:
    - `@default` annotations on every `<VSelect>` prop with a default.
    - Descriptions on every event emitted by `<VSelect>` (incl. how
      `@search` interacts with `searchDebounce`/`minSearchLength`).
    - Usage example + per-method docs on the four `defineExpose` methods
      (`open`/`close`/`focus`/`clear`).
    - `VSelectLabels`: which keys are SR-only vs. visible UI, callback
      signatures with fallback defaults.
    - `useSelect`: JSDoc on every input prop AND every return key
      (`isOpen`, `visibleOptions`, `labelMap`, `handleSelect`, …) — these
      are what headless consumers see in their IDE.
    - `useClickOutside` gained `@param`/`@example` blocks.
    - `SelectOption`/`SelectValue`/`FlatOption`/`SelectModelValue` each
      have a top-level JSDoc explaining the design constraints.
    - `<VSelectOption>` props and emits fully documented.

  Bundle size unchanged — JSDoc ships in `.d.ts` only.
