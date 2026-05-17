---
"@vue-select-plus/vue": patch
---

Accessibility and internationalisation polish.

- **Listbox no longer carries conflicting `aria-label` + `aria-labelledby`.**
  Both were being set whenever an external `<label>` was present. ARIA lint
  tools flagged the combination as a conflict (even though `aria-labelledby`
  wins per spec). The component now picks exactly one: `aria-labelledby` when
  a label element exists, `aria-label` otherwise.
- **Tree expand / collapse / add-child accessible labels are now i18n-able.**
  The strings `Expand …`, `Collapse …`, and `Add child to …` were hard-coded
  English. The `labels` prop gained three new function keys:
    - `expand?(label: string) => string`
    - `collapse?(label: string) => string`
    - `addChildTo?(label: string) => string`

  Pass any of them to translate; omit to keep the English defaults.
