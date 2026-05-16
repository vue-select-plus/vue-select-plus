---
layout: home

hero:
    name: "Vue Select Plus"
    text: "Accessible, headless, enterprise-ready."
    tagline: A WAI-ARIA-1.2 combobox for Vue 3 — async search, virtualized, theme-able, SSR-safe.
    image:
        src: /logo.webp
        alt: Vue Select Plus
    actions:
        - theme: brand
          text: Get Started
          link: /vue/getting-started
        - theme: alt
          text: Live Examples
          link: /vue/examples
        - theme: alt
          text: Headless Core
          link: /core/getting-started

features:
    - title: 🦾 Truly accessible
      details: WAI-ARIA 1.2 combobox pattern, full keyboard support, live regions, forced-colors styling. Passes axe out of the box.
    - title: ⏳ Async ready
      details: Loading state, aria-busy, debounce, min-search-length, race-guard hooks. Server-driven search is a single prop away.
    - title: 🌲 Tree + multi + creator
      details: Infinite nesting with expand/collapse navigation, multi-select with tags, inline create-child UX. All optional, all composable.
    - title: 🪟 Floating UI
      details: Auto-flips, sticks to the trigger width, teleports to body so it escapes overflow and z-index hell.
    - title: 📋 Native forms
      details: Pass a name and the component emits hidden inputs that serialize like a native select via FormData.
    - title: 🚀 Virtualized
      details: 100k+ options without breaking a sweat. Powered by TanStack Virtual under the hood.
    - title: 🎨 Theme-able
      details: CSS variables, automatic dark mode, prefers-reduced-motion, Windows High Contrast — all wired in.
    - title: 🧩 Headless core
      details: Use just the composables to build a fully custom UI on top of the same battle-tested state machine.
    - title: 🦺 TypeScript first
      details: Strict types throughout, SSR-safe IDs via Vue 3.5's useId, peer-dep Vue 3 only.
---

<style>
:root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
}
</style>
