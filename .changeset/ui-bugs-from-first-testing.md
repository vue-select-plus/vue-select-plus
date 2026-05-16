---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

UI bugs surfaced by first real-world usage.

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
