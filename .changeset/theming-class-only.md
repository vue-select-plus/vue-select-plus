---
"@vue-select-plus/styles": patch
"@vue-select-plus/vue": patch
---

The default styles no longer flip to dark on
`@media (prefers-color-scheme: dark)`. In real apps that turned out to be
surprising more often than useful — VitePress, Tailwind class-mode, Nuxt
UI and friends all toggle `.dark` on `<html>` and never apply a `.light`
class, so a light page on a dark-preferring OS would flip `<VSelect>` to
dark against the page's explicit choice. Theme now follows the host
class only.

> Behaviour change. Apps that relied on the implicit
> `prefers-color-scheme` switch will stay light by default. Toggle
> `.vsp-dark` yourself, or copy the eight-line opt-in snippet from the
> styles README.

Other bits:
- New `.vsp-light` class for the dark-page-light-card scenario.
- New `--vs-opacity-disabled` token (the 0.6 was hard-coded).
- README + troubleshooting spell out the three Tailwind-`.dark`
  integration patterns and flag the legacy mapping for removal in v1.0.
- Light theme tokens are listed once via `:root, .vsp-light` instead of
  two near-identical 17-line blocks.
