---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Trim the verbose comments, JSDoc, and section banners that ship inside
`dist/*.d.ts` (core, vue) and `src/style.css` (styles). The non-obvious
"why" comments stay; everything that just restated the code or the
type is gone. No API change, no behaviour change — IDE tooltips just
get more concise.
