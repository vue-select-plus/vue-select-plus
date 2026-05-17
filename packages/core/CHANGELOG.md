# @vue-select-plus/core

## 0.1.2

### Patch Changes

- [#13](https://github.com/vue-select-plus/vue-select-plus/pull/13) [`469df6c`](https://github.com/vue-select-plus/vue-select-plus/commit/469df6c8663add7a90ecc63a1e6c5d2eaff1d531) Thanks [@lmathey](https://github.com/lmathey)! - Build, packaging, and tooling improvements.

  - **No more source-path leaks in the published `.d.ts` files.** Cross-package
    imports were emitted as `from '../../core/src/index.ts'` instead of
    `from '@vue-select-plus/core'`. vite-plugin-dts followed the workspace
    path alias and inlined the resolved file path. Fixed via a build-only
    `tsconfig.build.json` (no cross-package aliases) plus a `beforeWriteFile`
    hook in the dts plugin that rewrites any leaked source path back to the
    package name.
  - **Source maps now ship.** `dist/index.js.map` and `dist/index.umd.cjs.map`
    are published for both `@vue-select-plus/core` and `@vue-select-plus/vue`.
    Stack traces in consumer apps resolve to original source locations
    instead of minified column numbers.
  - **Simplified `@vue-select-plus/styles` exports map.** The redundant
    `./style.css` subpath has been removed. The package now exports only `.`
    pointing at the same file; one canonical path for bundlers, slightly
    faster resolution.

- [#13](https://github.com/vue-select-plus/vue-select-plus/pull/13) [`469df6c`](https://github.com/vue-select-plus/vue-select-plus/commit/469df6c8663add7a90ecc63a1e6c5d2eaff1d531) Thanks [@lmathey](https://github.com/lmathey)! - Headless DX: type consistency, cleaner tooltips, JSDoc on the whole public API.

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

- [#13](https://github.com/vue-select-plus/vue-select-plus/pull/13) [`469df6c`](https://github.com/vue-select-plus/vue-select-plus/commit/469df6c8663add7a90ecc63a1e6c5d2eaff1d531) Thanks [@lmathey](https://github.com/lmathey)! - Performance + documentation gap-filling.

  - **Faster open for large option lists.** `useSelect.open()` skips the full
    options scan when the model is empty — halves the work done on every open
    for static lists of ≥ 5 000 items.
  - **Docs `Creator mode` example: new children now appear immediately.**
    VitePress' `<script setup>` in Markdown occasionally drops deep reactivity
    inside `reactive(...)` mutations. The example now uses `ref(...)` plus a
    whole-array swap on every create — bulletproof across SSR boundaries.
  - **New "Behaviour notes" section in the API reference.** Covers:
    - Tab-focus target per `searchable` (button vs. input, with a table).
    - Initial-highlight semantics on open (the "select-with-cursor" variant
      of the WAI-ARIA combobox pattern, not "no initial highlight").
    - `itemHeight` must match the actual row height when using custom
      `option` slots — otherwise the virtualizer drifts.
    - `labels` is a partial per-key merge; omitted keys keep their defaults.
  - **Slot table re-organised.** Each slot is now tagged with its target
    region (`trigger` vs `menu`) so the easy-to-confuse pair `loading` (menu)
    and `loading-icon` (trigger) is unambiguous.
  - **New troubleshooting section: opening with huge option lists.**
    Order-of-magnitude expectations + the dev-mode-vs-production caveat are
    now documented.

- [#13](https://github.com/vue-select-plus/vue-select-plus/pull/13) [`469df6c`](https://github.com/vue-select-plus/vue-select-plus/commit/469df6c8663add7a90ecc63a1e6c5d2eaff1d531) Thanks [@lmathey](https://github.com/lmathey)! - UI bugs surfaced by first real-world usage.

  - **Firefox: the dropdown no longer flies in from the top-left corner.** The
    open/close transition animated `transform`, which stomped Floating UI's
    positioning transform. Transitions now only fade `opacity`; position stays
    authoritative.
  - **Non-searchable trigger: no more 1 px white line under the placeholder.**
    The invisible focus-target `<button>` used `block-size: 1px`, which rendered
    as a hairline strip in some themes. It's now sized via the standard
    screen-reader-only pattern, fully outside the visual layout. Firefox's
    `::-moz-focus-inner` default border is reset too.
  - **Searchable mode: placeholder is no longer rendered twice.** The
    placeholder span and `<input placeholder="">` both wrote the same text on
    top of each other. The span is suppressed when `searchable` is set; the
    input's native placeholder owns the row. The multi-mode-no-tags case still
    shows the placeholder (via the input attribute).
  - **Searchable + selected + closed: the label is no longer doubled** (the
    classic "Apple Apple" report). The input is hidden via `v-show` while the
    menu is closed and a value is selected — the bold single-value span owns
    that state. The input reappears the moment the menu opens or the value is
    cleared; it stays in the DOM, so focus management keeps working.

## 0.1.1

### Patch Changes

- [#11](https://github.com/vue-select-plus/vue-select-plus/pull/11) [`7b1d8db`](https://github.com/vue-select-plus/vue-select-plus/commit/7b1d8dbd6e3deb8b27b6d9c81d8163ccb4aa426a) Thanks [@lmathey](https://github.com/lmathey)! - Polish fixes from the first round of real-world testing.

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

## 0.1.0

### Minor Changes

- [#8](https://github.com/vue-select-plus/vue-select-plus/pull/8) [`e75e2db`](https://github.com/vue-select-plus/vue-select-plus/commit/e75e2dbaa036397ce67ce86e3148739ed0ce6d3f) Thanks [@lmathey](https://github.com/lmathey)! - First public-grade release — bumps `0.0.2` → `0.1.0`. The full list of changes lives in [`CHANGELOG.md`](https://github.com/vue-select-plus/vue-select-plus/blob/main/CHANGELOG.md). Highlights:

  - WAI-ARIA 1.2 combobox pattern, including announcement of the selected value.
  - Floating UI for dropdown positioning (auto-flip, viewport-aware, teleported to `<body>` by default).
  - Async / server-side search with `loading`, `filterable`, `minSearchLength`, `searchDebounce`.
  - Native HTML5 `required` validation via `validateOnSubmit`.
  - Size variants (`sm` / `md` / `lg`), open/close transitions, Tailwind-safe `.vsp-dark` class.
  - Public API of `@vue-select-plus/core` narrowed to `useSelect` + `useClickOutside` + types.
  - Peer dependency bumped to `vue@^3.5.0` (uses `useId()`).
