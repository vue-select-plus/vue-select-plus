---
"@vue-select-plus/styles": patch
"@vue-select-plus/vue": patch
---

Theming is now purely class-driven; no more surprise dark mode.

- **The default styles no longer listen to `@media (prefers-color-scheme: dark)`.**
  The previous `:root:not(.light)` gate didn't help in practice: VitePress,
  Tailwind class-mode, Nuxt UI and friends all toggle `.dark` on `<html>` and
  *remove* it for light — they never apply `.light`. So a light page on a
  dark-preferring OS would flip `<VSelect>` to dark against the page's
  explicit choice. The component now follows the host class only:
    - `.dark` or `.vsp-dark` on a parent → dark theme,
    - absence of either → light theme,
    - OS preference → ignored by default.

  Consumers who want OS-driven switching get a documented 8-line opt-in
  snippet (in the styles README and the troubleshooting guide); the
  playground demonstrates the reactive JavaScript pattern.

  **Behaviour change.** Apps that relied on the implicit
  `prefers-color-scheme` dark switch will now stay light by default. Pre-1.0
  patch — semver permits this.

- **New `.vsp-light` class.** Symmetric to `.vsp-dark`. Pin a single
  `<VSelect>` to its light theme even when an ancestor is `.dark` — useful
  for toasts, modals, or "dark page, light card" layouts.

- **New `--vs-opacity-disabled` token.** The disabled-state opacity (0.6) is
  no longer hardcoded; override it on `:root` to match your design system.

- **Tailwind `.dark` collision: documentation upgraded.** The README and
  troubleshooting now spell out three integration patterns (Tailwind-only,
  both, VSP-only) and flag the legacy `.dark` mapping for removal in v1.0.
