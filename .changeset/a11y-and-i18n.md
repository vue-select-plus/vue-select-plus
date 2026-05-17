---
"@vue-select-plus/vue": patch
---

Accessibility and internationalisation polish.

- **Listbox no longer carries conflicting `aria-label` + `aria-labelledby`.**
  Both were being set whenever an external `<label>` was present. ARIA lint
  tools flagged the combination as a conflict (even though `aria-labelledby`
  wins per spec). The component now picks exactly one: `aria-labelledby` when
  a label element exists, `aria-label` otherwise.
- **`aria-level` is no longer emitted on flat-list options.** Every row used
  to receive `aria-level="1"`, which axe-core 4.11 flags as ARIA misuse —
  the value is correct but `aria-level` is only meaningful when rows belong
  to a real hierarchy. The attribute is now emitted only when the row is at
  `depth > 0` *or* has children (i.e., the listbox is actually used as a
  tree). Pure flat lists are now axe-clean on this rule.
- **Tree expand / collapse / add-child accessible labels are now i18n-able.**
  The strings `Expand …`, `Collapse …`, and `Add child to …` were hard-coded
  English. The `labels` prop gained three new function keys:
    - `expand?(label: string) => string`
    - `collapse?(label: string) => string`
    - `addChildTo?(label: string) => string`

  Pass any of them to translate; omit to keep the English defaults.
