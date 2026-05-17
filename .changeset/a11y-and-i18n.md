---
"@vue-select-plus/vue": patch
---

Two ARIA fixes and a small i18n gap on the tree.

The listbox used to set `aria-label` and `aria-labelledby` at the same
time whenever an external `<label>` was present. Spec-wise
`aria-labelledby` wins, but ARIA linters complain about the combination
either way — the component now picks one based on whether a label
exists.

`aria-level` was being emitted on every option (`"1"` for flat lists),
which axe-core flags as ARIA misuse. It now only renders on rows that
actually live in a tree (`depth > 0` or has children).

The tree expand / collapse / add-child accessible labels were hard-coded
English. Three new keys on the `labels` prop — `expand`, `collapse`,
`addChildTo` — let you translate them.
