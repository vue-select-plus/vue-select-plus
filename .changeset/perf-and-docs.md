---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

`useSelect.open()` skips the full options scan when the model is empty.
For static lists of 5k+ items this halves the work done on every open.

`searchDebounce` default changed from `200` → `0`. The throttle made
every keystroke feel laggy in interactive testing. If you were relying
on the implicit 200 ms to coalesce requests against a rate-limited
backend, set `search-debounce` explicitly to restore it — this is a
behaviour change but pre-1.0 patch.

Docs:
- The "Creator mode" example now uses `ref(...)` with whole-array
  replacement instead of a `reactive(...)` mutation, which VitePress'
  `<script setup>` in Markdown sometimes drops.
- New "Behaviour notes" section in the API reference covering tab-focus
  per `searchable`, the initial-highlight semantics, the `itemHeight`
  caveat with custom option slots, and the per-key merge semantics of
  `labels`.
- Slot table now tags each slot as `trigger` or `menu` so `loading`
  (menu) and `loading-icon` (trigger) stop getting confused.
- Troubleshooting gets a new section on huge option lists with
  order-of-magnitude expectations and the dev-vs-prod caveat.
