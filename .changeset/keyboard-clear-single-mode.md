---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

Backspace in single mode now clears the selected value, mirroring the
multi-mode shortcut that pops the last tag. Both still gate on an
empty search input so they don't hijack normal text editing.

This closes a WCAG 2.1.1 (Keyboard) gap: the visible `×` clear button
carries `tabindex="-1"` so it isn't reachable via Tab, and single
mode previously had no keyboard path to clear the selection at all.
