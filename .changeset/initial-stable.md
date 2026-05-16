---
"@vue-select-plus/core": minor
"@vue-select-plus/vue": minor
"@vue-select-plus/styles": minor
---

First public-grade release — bumps `0.0.2` → `0.1.0`. The full list of changes lives in [`CHANGELOG.md`](https://github.com/vue-select-plus/vue-select-plus/blob/main/CHANGELOG.md). Highlights:

- WAI-ARIA 1.2 combobox pattern, including announcement of the selected value.
- Floating UI for dropdown positioning (auto-flip, viewport-aware, teleported to `<body>` by default).
- Async / server-side search with `loading`, `filterable`, `minSearchLength`, `searchDebounce`.
- Native HTML5 `required` validation via `validateOnSubmit`.
- Size variants (`sm` / `md` / `lg`), open/close transitions, Tailwind-safe `.vsp-dark` class.
- Public API of `@vue-select-plus/core` narrowed to `useSelect` + `useClickOutside` + types.
- Peer dependency bumped to `vue@^3.5.0` (uses `useId()`).
