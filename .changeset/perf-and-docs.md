---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
---

Performance + documentation gap-filling.

- **Faster open for large option lists.** `useSelect.open()` skips the full
  options scan when the model is empty — halves the work done on every open
  for static lists of ≥ 5 000 items.
- **`searchDebounce` default lowered from `200` → `0`.** The 200 ms default
  felt sluggish in interactive testing — every keystroke produced visible
  lag before the option list refreshed. The new default emits immediately;
  if you need debouncing (e.g., your `@search` handler hits a rate-limited
  backend) pass an explicit value like `:search-debounce="200"`.

  **Behaviour change.** Apps that *relied* on the implicit 200 ms throttle
  to coalesce keystrokes into one backend request will now fire one request
  per keystroke. Set `search-debounce` explicitly to restore the old
  cadence. Pre-1.0 patch — semver permits this.
- **Docs `Creator mode` example: new children now appear immediately.**
  VitePress' `<script setup>` in Markdown occasionally drops deep reactivity
  inside `reactive(...)` mutations. The example now uses `ref(...)` plus a
  whole-array swap on every create — bulletproof across SSR boundaries.
- **New "Behaviour notes" section in the API reference.** Covers:
    - Tab-focus target per `searchable` (button vs. input, with a table).
    - Initial-highlight semantics on open (the "select-with-cursor" variant
      of the WAI-ARIA combobox pattern, not "no initial highlight").
    - `itemHeight` must match the actual row height when using custom
      `option` slots — otherwise the virtualizer drifts.
    - `labels` is a partial per-key merge; omitted keys keep their defaults.
- **Slot table re-organised.** Each slot is now tagged with its target
  region (`trigger` vs `menu`) so the easy-to-confuse pair `loading` (menu)
  and `loading-icon` (trigger) is unambiguous.
- **New troubleshooting section: opening with huge option lists.**
  Order-of-magnitude expectations + the dev-mode-vs-production caveat are
  now documented.
