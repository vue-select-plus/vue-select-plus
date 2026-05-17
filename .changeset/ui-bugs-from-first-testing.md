---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

A handful of UI bugs surfaced as soon as the package hit a real app.

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
