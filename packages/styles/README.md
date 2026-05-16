# @vue-select-plus/styles

[![npm version](https://img.shields.io/npm/v/@vue-select-plus/styles?style=flat-square&color=41d1ff)](https://www.npmjs.com/package/@vue-select-plus/styles)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

The default theme for [`@vue-select-plus/vue`](https://www.npmjs.com/package/@vue-select-plus/vue). Plain CSS — no preprocessor, no runtime, no JS.

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
