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
