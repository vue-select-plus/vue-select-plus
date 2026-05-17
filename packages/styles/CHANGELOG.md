# @vue-select-plus/styles

## 0.1.5

### Patch Changes

- [#15](https://github.com/vue-select-plus/vue-select-plus/pull/15) [`42b0d2f`](https://github.com/vue-select-plus/vue-select-plus/commit/42b0d2f9aa4e76ad35cd19fff74005e6aff2e41d) Thanks [@lmathey](https://github.com/lmathey)! - Build/packaging cleanup.

  Public `.d.ts` files no longer leak workspace source paths
  (`from '../../core/src/index.ts'`). Fixed via a build-only
  `tsconfig.build.json` without the cross-package alias, plus a
  `beforeWriteFile` hook in vite-plugin-dts that rewrites any leaked path
  back to the package name.

  Source maps now ship for both `@vue-select-plus/core` and `@vue-select-plus/vue`,
  so consumer stack traces resolve to original source locations instead
  of minified columns.

  `@vue-select-plus/styles` exports map simplified to a single `.` entry.

  The default stylesheet now also ships inside `@vue-select-plus/vue`,
  exposed as `@vue-select-plus/vue/styles.css` (plus `./styles` and
  `./style.css` aliases). Consumers can now install just the vue package
  and import the CSS by subpath — previously the documented
  `import '@vue-select-plus/styles'` failed under pnpm strict mode, which
  doesn't hoist transitive deps into the consumer's `node_modules`. The
  separate `@vue-select-plus/styles` package still publishes the same
  file for anyone who prefers to install it explicitly.

- [#15](https://github.com/vue-select-plus/vue-select-plus/pull/15) [`6df227b`](https://github.com/vue-select-plus/vue-select-plus/commit/6df227b3f94d5c19f8a5d87355041b4722d44749) Thanks [@lmathey](https://github.com/lmathey)! - Round two of external review fixes.

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

- [#15](https://github.com/vue-select-plus/vue-select-plus/pull/15) [`42b0d2f`](https://github.com/vue-select-plus/vue-select-plus/commit/42b0d2f9aa4e76ad35cd19fff74005e6aff2e41d) Thanks [@lmathey](https://github.com/lmathey)! - The default styles no longer flip to dark on
  `@media (prefers-color-scheme: dark)`. In real apps that turned out to be
  surprising more often than useful — VitePress, Tailwind class-mode, Nuxt
  UI and friends all toggle `.dark` on `<html>` and never apply a `.light`
  class, so a light page on a dark-preferring OS would flip `<VSelect>` to
  dark against the page's explicit choice. Theme now follows the host
  class only.

  > Behaviour change. Apps that relied on the implicit
  > `prefers-color-scheme` switch will stay light by default. Toggle
  > `.vsp-dark` yourself, or copy the eight-line opt-in snippet from the
  > styles README.

  Other bits:

  - New `.vsp-light` class for the dark-page-light-card scenario.
  - New `--vs-opacity-disabled` token (the 0.6 was hard-coded).
  - README + troubleshooting spell out the three Tailwind-`.dark`
    integration patterns and flag the legacy mapping for removal in v1.0.
  - Light theme tokens are listed once via `:root, .vsp-light` instead of
    two near-identical 17-line blocks.

- [#15](https://github.com/vue-select-plus/vue-select-plus/pull/15) [`171636e`](https://github.com/vue-select-plus/vue-select-plus/commit/171636ee19a0c5ece0918a302f7d933f23aa1963) Thanks [@lmathey](https://github.com/lmathey)! - Trim the verbose comments, JSDoc, and section banners that ship inside
  `dist/*.d.ts` (core, vue) and `src/style.css` (styles). The non-obvious
  "why" comments stay; everything that just restated the code or the
  type is gone. No API change, no behaviour change — IDE tooltips just
  get more concise.

- [#15](https://github.com/vue-select-plus/vue-select-plus/pull/15) [`42b0d2f`](https://github.com/vue-select-plus/vue-select-plus/commit/42b0d2f9aa4e76ad35cd19fff74005e6aff2e41d) Thanks [@lmathey](https://github.com/lmathey)! - A handful of UI bugs surfaced as soon as the package hit a real app.

  - Dropdown no longer flies in from the top-left in Firefox. The
    enter/leave transition was animating `transform`, which fought with
    Floating UI's positioning transform; only `opacity` is animated now.
  - 1 px hairline strip under the non-searchable trigger is gone — the
    hidden focus-target `<button>` is sized via the standard sr-only
    pattern instead of `block-size: 1px`. Firefox's
    `::-moz-focus-inner` border is reset too.
  - Searchable mode no longer paints the placeholder twice (the placeholder
    span and the `<input placeholder="">` were both writing the same text).
  - "Apple Apple" report fixed: with a value selected and the menu closed,
    the search input is now `v-show`-hidden so it doesn't double up the
    single-value label. It comes back when the menu opens or the value
    clears.

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

- [#13](https://github.com/vue-select-plus/vue-select-plus/pull/13) [`469df6c`](https://github.com/vue-select-plus/vue-select-plus/commit/469df6c8663add7a90ecc63a1e6c5d2eaff1d531) Thanks [@lmathey](https://github.com/lmathey)! - Theming is now purely class-driven; no more surprise dark mode.

  - **The default styles no longer listen to `@media (prefers-color-scheme: dark)`.**
    The previous `:root:not(.light)` gate didn't help in practice: VitePress,
    Tailwind class-mode, Nuxt UI and friends all toggle `.dark` on `<html>` and
    _remove_ it for light — they never apply `.light`. So a light page on a
    dark-preferring OS would flip `<VSelect>` to dark against the page's
    explicit choice. The component now follows the host class only:

    - `.dark` or `.vsp-dark` on a parent → dark theme,
    - absence of either → light theme,
    - OS preference → ignored by default.

    Consumers who want OS-driven switching get a documented 8-line opt-in
    snippet (in the styles README and the troubleshooting guide); the
    playground demonstrates the reactive JavaScript pattern.

    **Behaviour change.** Apps that relied on the implicit
    `prefers-color-scheme` dark switch will now stay light by default. Pre-1.0
    patch — semver permits this.

  - **New `.vsp-light` class.** Symmetric to `.vsp-dark`. Pin a single
    `<VSelect>` to its light theme even when an ancestor is `.dark` — useful
    for toasts, modals, or "dark page, light card" layouts.

  - **New `--vs-opacity-disabled` token.** The disabled-state opacity (0.6) is
    no longer hardcoded; override it on `:root` to match your design system.

  - **Tailwind `.dark` collision: documentation upgraded.** The README and
    troubleshooting now spell out three integration patterns (Tailwind-only,
    both, VSP-only) and flag the legacy `.dark` mapping for removal in v1.0.

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
