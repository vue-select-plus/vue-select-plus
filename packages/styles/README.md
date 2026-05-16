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

## Tailwind users

This package's `.dark` class collides with Tailwind's dark mode. Use the namespaced **`.vsp-dark`** class instead — same effect, no collision:

```html
<html class="dark">       <!-- Tailwind dark mode -->
<html class="vsp-dark">   <!-- Vue Select Plus dark mode (recommended) -->
```

## License

[MIT](./LICENSE) © Leon Mathey
