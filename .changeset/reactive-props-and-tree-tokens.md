---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Reactive prop wiring, tree-indent tokens, and listbox-state polish.

- **Fix: `multiple` and `searchable` are now reactive on `<VSelect>`.** The
  composable was already typed as `MaybeRefOrGetter<boolean>`, but the
  component was passing `props.multiple` / `props.searchable` as plain
  values — runtime flips of those props had no effect on the headless
  state. Both props are now wrapped with `toRef`. Flipping between single
  ↔ multi (or toggling `searchable`) at runtime now reconfigures the
  composable as expected.
- **Highlight resets to the first navigable row when the option list
  changes while the menu is open.** Previously it only reset when the
  highlighted index went out of bounds. For server-driven search the list
  is often *replaced*: same length, different items, and the visible
  highlight stayed on a position whose underlying option had changed. The
  watch now resets to `navigableIndices[0]` on every change.
- **Tree indentation is parameterised via CSS variables.** New tokens
  `--vs-tree-indent-step`, `--vs-tree-indent-base`, and
  `--vs-tree-toggle-gap` are now the single source of truth for the
  per-depth padding (used in `VSelectOption`'s inline style via `calc()`),
  the chevron toggle button's size, and the leaf-row spacer width.
  Override one variable and JS + CSS stay in sync.
- **Menu sizing exposed via CSS custom properties.** Floating UI used to
  write `minWidth` / `maxHeight` directly to the floating element's inline
  style, which consumers couldn't override without `!important`. The
  middleware now writes `--vsp-menu-control-width` /
  `--vsp-menu-available-height` instead, and the stylesheet reads them as
  fallbacks behind the user-overridable `--vs-menu-min-width` /
  `--vs-menu-max-height`.
- **Runtime guard for the required `options` prop.** TS-first
  `defineProps<T>()` does not emit runtime validation in production
  builds, so JS consumers who forgot the prop used to crash deep inside
  `useSelect` with a confusing stack. The component now throws a clear
  `TypeError` at setup time instead.
