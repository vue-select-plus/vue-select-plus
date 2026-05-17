---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Round two of external review fixes.

`<VSelect>` was passing `props.multiple` / `props.searchable` as plain
values to `useSelect`, so runtime flips of those props had no effect
on the headless state even though the composable accepted refs.
Both wrapped with `toRef` now.

When the option list changes while the menu is open, the highlight
resets to the first navigable row. Previously it only moved when the
highlighted index fell out of bounds — server-driven search typically
replaces the whole list, and the highlight would sit on a position
whose underlying option had changed.

Tree indentation is parameterised via three CSS variables:
`--vs-tree-indent-step`, `--vs-tree-indent-base`, `--vs-tree-toggle-gap`.
JS uses them through `calc()` for the per-depth padding; the toggle
button and leaf spacer read the same tokens. Override one and JS + CSS
stay in sync.

Floating UI's middleware no longer writes `minWidth` / `maxHeight`
directly to the menu's inline style. It writes the measured values into
`--vsp-menu-control-width` / `--vsp-menu-available-height`, and the
stylesheet reads them as fallbacks behind the user-overridable
`--vs-menu-min-width` / `--vs-menu-max-height`. Consumers can override
either without `!important`.

A missing `options` prop now throws a clear `TypeError` at setup time
instead of crashing deep inside `useSelect`. TS-only `defineProps<T>()`
strips runtime validation in production builds, so JS consumers had no
useful signal otherwise.
