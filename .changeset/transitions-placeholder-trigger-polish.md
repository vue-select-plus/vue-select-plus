---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Polish fixes from the first round of real-world testing.

- **Firefox: dropdown no longer flies in from the top-left corner.** The
  open/close transition animated `transform`, which stomped Floating UI's
  positioning transform. Transitions now only fade opacity — position stays
  authoritative.
- **Non-searchable trigger: no more 1 px white line under the placeholder.**
  The invisible focus-target button used `block-size: 1px` which rendered as
  a hairline strip in some themes. It's now sized via the standard
  screen-reader-only pattern, fully outside the visual layout. Firefox's
  `::-moz-focus-inner` default border is reset too.
- **Searchable mode: placeholder is no longer rendered twice.** The
  placeholder span and the `<input placeholder="">` both wrote the same text
  on top of each other. The span is now suppressed when `searchable` is set;
  the input's native placeholder owns the row.
- **Multi + searchable + no tags: placeholder is back.** The previous fix
  would have hidden the placeholder entirely in this state — the input now
  shows it via its own `placeholder` attribute.
- **Searchable + selected value + menu closed: label is no longer doubled.**
  The bold single-value span and the input's placeholder both rendered the
  selected label, producing `"Apple Apple"`. The input is now hidden via
  `v-show` while the menu is closed and a value is selected — the single-
  value span owns that state. The input reappears (still in the DOM, so
  focus management keeps working) the moment the menu opens or the value
  is cleared.
- **Faster open for large option lists.** `useSelect.open()` skips the
  full-options scan when the model is empty, halving the work on every open
  for static lists ≥ 5 000 items.
- **Docs `Creator mode` example: new children now appear immediately.**
  VitePress' `<script setup>` in Markdown occasionally drops deep reactivity
  inside `reactive(...)` mutations. The example now uses `ref(...)` plus a
  whole-array replacement, which is bulletproof across SSR boundaries.
- **New troubleshooting section: opening with huge option lists.** Order-of-
  magnitude expectations + the dev-mode-vs-production caveat are now
  documented.
- **DX: JSDoc on the entire public API, not just props.** `@default`
  annotations on every prop with a default. Descriptions on every event
  emitted by `<VSelect>` (incl. how `@search` interacts with
  `searchDebounce`/`minSearchLength`). The four `defineExpose` methods
  (`open`/`close`/`focus`/`clear`) now have a usage example. `VSelectLabels`
  spells out which keys are SR-only vs. visible, and the callback signatures
  with their fallback defaults. The Core composable `useSelect` has JSDoc on
  every input prop and every return key (`isOpen`, `visibleOptions`,
  `labelMap`, `handleSelect`, …) — critical for headless consumers who
  only see the type signature. `useClickOutside` gained `@param`/`@example`
  blocks. `SelectOption`/`SelectValue`/`FlatOption`/`SelectModelValue` each
  have a top-level JSDoc explaining the design constraint (why values are
  primitive, why `FlatOption` is internal-only, why `null` ≡ `undefined`).
  `VSelectOption` props/emits documented. Bundle size unchanged — JSDoc
  ships in `.d.ts`, not in the runtime JS.
- **Fixed: source paths leaking into generated `.d.ts` files.** Cross-package
  imports were emitted as `from '../../core/src/index.ts'` instead of
  `from '@vue-select-plus/core'`. The published declarations now resolve via
  the package name, so consumer tooling treats `@vue-select-plus/core` as a
  proper peer (and not a relative source dependency that doesn't exist in
  their install).
- **Simplified `@vue-select-plus/styles` exports map.** The redundant
  `./style.css` subpath has been removed; the package now exports only `.`
  pointing at the same file. Bundlers tree-shake the import marginally
  faster, and there's only one canonical path.
- **Tailwind `.dark` collision: documentation upgraded.** The README and
  troubleshooting now spell out the three integration patterns (Tailwind-
  only, both, VSP-only) and clearly call the legacy `.dark` mapping out as
  v1.0-removal. No behaviour change in 0.1.x.
- **Listbox no longer carries conflicting `aria-label` + `aria-labelledby`.**
  Both were being set when an external label was present; ARIA lint tools
  flagged the combo as a conflict (even though `aria-labelledby` wins per
  spec). The component now picks exactly one: labelledby when a label
  element exists, label otherwise.
- **Tree expand/collapse + add-child accessible labels are now i18n-able.**
  The strings `Expand …`, `Collapse …`, and `Add child to …` were hard-
  coded English. The `labels` prop gained three new function keys:
  `expand(label)`, `collapse(label)`, and `addChildTo(label)`. Pass any
  of them to translate; omit to keep the English defaults.
- **`useSelect` props are now consistent.** `multiple` and `searchable`
  were typed as plain `boolean` while `disabled`, `filterable`, `options`
  used `Ref` / `MaybeRefOrGetter`. Headless consumers can now bind any of
  them to a ref or computed — toggling single ↔ multi (or searchable on/
  off) at runtime works. Backward compatible: plain values still accepted.
- **Cleaner type display for `collapsedValues`.** The IDE used to show
  `Ref<Set<SelectValue> & Omit<Set<SelectValue>, …>>` in tooltips, courtesy
  of TypeScript's inference for `ref(new Set())`. Now annotated explicitly
  as `Ref<Set<SelectValue>>`.
- **New `--vs-opacity-disabled` token.** The disabled-state opacity (0.6)
  is no longer hardcoded; override it on `:root` to match your design
  system.
- **New `.vsp-light` class for explicit light pinning.** Useful when a
  parent has `.dark` (e.g. Tailwind on `<html>`) but you want a specific
  `<VSelect>` to stay light. Symmetric to `.vsp-dark`.
- **Source maps are now published.** `dist/index.js.map` and
  `dist/index.umd.cjs.map` ship alongside the build outputs for both
  `core` and `vue`. Consumer stack traces resolve to original source
  locations instead of minified column numbers.
- **Docs: behaviour notes for `searchable` focus target, initial
  highlight, `itemHeight`, and `labels` merge semantics.** The API
  reference gained a "Behaviour notes" section so consumers don't have
  to spelunk through the source. The slot table now also tags each slot
  as `trigger` vs `menu` to disambiguate `loading` (menu) from
  `loading-icon` (trigger).
- **No more "VSelect went dark behind your app's back".** The default
  styles no longer listen to `@media (prefers-color-scheme: dark)`. The
  previous `:root:not(.light)` gate didn't help: VitePress / Tailwind /
  Nuxt UI all toggle `.dark` on `<html>` and remove it for light — they
  never set `.light`. So a light page on a dark-preferring OS would flip
  `<VSelect>` to dark against the page's explicit choice. The component
  is now class-only by default: `.dark` or `.vsp-dark` turns it dark,
  absence keeps it light, regardless of the OS. Consumers who want OS-
  driven switching get a documented CSS snippet (in the styles README and
  the troubleshooting guide); the playground demonstrates the reactive
  JavaScript pattern. **Note:** this is a behaviour change. Apps that
  relied on the implicit `prefers-color-scheme` dark switch will now stay
  light by default. Pre-1.0 patch — semver permits this; CHANGELOG flags
  it prominently.
