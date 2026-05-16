# @vue-select-plus/vue

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

- Updated dependencies [[`7b1d8db`](https://github.com/vue-select-plus/vue-select-plus/commit/7b1d8dbd6e3deb8b27b6d9c81d8163ccb4aa426a)]:
  - @vue-select-plus/core@0.1.1
  - @vue-select-plus/styles@0.1.1

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

### Patch Changes

- Updated dependencies [[`e75e2db`](https://github.com/vue-select-plus/vue-select-plus/commit/e75e2dbaa036397ce67ce86e3148739ed0ce6d3f)]:
  - @vue-select-plus/core@0.1.0
  - @vue-select-plus/styles@0.1.0
