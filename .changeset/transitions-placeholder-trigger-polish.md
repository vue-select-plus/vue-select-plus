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
