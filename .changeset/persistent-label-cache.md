---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

`useOptions` now keeps a persistent label cache. Values that have been
in `options` at any point during the component's lifetime keep their
labels even after the array is swapped — common in paginated server
search, tab switches, or any flow that replaces the visible page of
results.

Without this, a v-model holding `"u-12345"` (Alice) would render as
the raw id in the trigger or as the tag's text the moment Alice was
no longer in the current `options` page. Tags now stay labelled, and
the single-value display keeps the correct text.

Current `options` still win when a value reappears with a new label
(useful when a server response renames an entity). The cache only
grows; it isn't cleared automatically. For most apps that's a few
hundred entries even over long sessions — negligible memory.
