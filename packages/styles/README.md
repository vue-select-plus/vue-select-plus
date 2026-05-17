# @vue-select-plus/styles

[![npm version](https://img.shields.io/npm/v/@vue-select-plus/styles?style=flat-square&color=41d1ff)](https://www.npmjs.com/package/@vue-select-plus/styles)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

The default theme for [`@vue-select-plus/vue`](https://www.npmjs.com/package/@vue-select-plus/vue). Plain CSS — no preprocessor, no runtime, no JS.

> **You probably don't need to install this package directly.** The same
> stylesheet is re-exported by `@vue-select-plus/vue` under
> `@vue-select-plus/vue/styles.css`, which works under every package manager
> (including pnpm strict mode and yarn berry PnP). Install this package only
> if you want to consume the CSS without the Vue component (e.g. SSR shells,
> design-system bundles, theme overrides shipped separately).

## Install

```bash
npm install @vue-select-plus/styles
```

## Use

Import once, anywhere in your app's entry:

```ts
import '@vue-select-plus/styles';
```

Or directly via a stylesheet tag, if your bundler supports CSS-from-node-modules:

```html
<link rel="stylesheet" href="node_modules/@vue-select-plus/styles/src/style.css" />
```

## Theming

Override the CSS variables on `:root`, `.dark`, `.vsp-dark`, or any ancestor — variables cascade:

```css
:root {
    --vs-primary: #16a34a;
    --vs-radius: 12px;
}

.dark, .vsp-dark {
    --vs-primary: #4ade80;
}
```

A full list of variables lives in the [API reference](https://vue-select-plus.github.io/vue-select-plus/vue/api#css-variables).

The default theme is opinionated but conservative: 4.5:1 contrast for body text, accessible focus rings, automatic dark mode via `prefers-color-scheme`, and full styling for Windows High Contrast and `prefers-reduced-motion`.

## Want OS-driven (system-preference) dark mode?

The default styles flip to dark only when `.dark` or `.vsp-dark` is present on a parent element — they do **not** listen to `prefers-color-scheme` on their own. That keeps the component in sync with whatever theme system your app already uses (Tailwind class-mode, Nuxt UI, VitePress, your own toggle, …).

If you want the component to follow the OS, add this snippet to your global CSS:

```css
@media (prefers-color-scheme: dark) {
    :root:not(.light) {
        /* Mirror the dark variables — same values the `.vsp-dark` block uses. */
        --vs-bg: #111827;
        --vs-bg-elevated: #1f2937;
        --vs-text: #f9fafb;
        --vs-text-muted: #9ca3af;
        --vs-border: #374151;
        --vs-selected-bg: #1e3a8a;
        --vs-selected-text: #ffffff;
        --vs-tag-bg: #312e81;
        --vs-tag-text: #c7d2fe;
        --vs-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.55);
        /* …and any other tokens you want to override */
    }
}
```

A simpler reactive approach: toggle `.vsp-dark` on `<html>` yourself in response to `window.matchMedia('(prefers-color-scheme: dark)')`. That's what the playground does — see [`playground/src/App.vue`](https://github.com/vue-select-plus/vue-select-plus/blob/main/playground/src/App.vue) for the 8-line pattern.

## Tailwind users — the `.dark` collision

This package currently maps **both** `.vsp-dark` and `.dark` to the dark theme. The `.dark` mapping collides with Tailwind, which owns that class by default. If you let Tailwind toggle `<html class="dark">`, Vue Select Plus flips to its dark variant at the same time — usually not what you want when you've themed the rest of your app yourself.

**Pick whichever fits:**

```html
<!-- Tailwind dark (page) + Vue Select Plus stays light -->
<html class="dark">  <!-- and use .vsp-dark to opt VSP in if/when needed -->

<!-- Both libraries go dark together -->
<html class="dark vsp-dark">

<!-- VSP dark only, Tailwind stays light -->
<html class="vsp-dark">
```

For full control, override the [CSS variables](#theming) in your own dark scope and ignore both classes:

```css
:root.your-app-dark {
    --vs-bg: #1f2937;
    --vs-text: #f9fafb;
    /* … */
}
```

> The legacy `.dark` mapping will be removed in v1.0. If you start a new project today, use `.vsp-dark` (or your own variable scope) — that's stable across the upcoming major.

## License

[MIT](./LICENSE) © Leon Mathey
