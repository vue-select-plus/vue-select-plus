---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Build, packaging, and tooling improvements.

- **No more source-path leaks in the published `.d.ts` files.** Cross-package
  imports were emitted as `from '../../core/src/index.ts'` instead of
  `from '@vue-select-plus/core'`. vite-plugin-dts followed the workspace
  path alias and inlined the resolved file path. Fixed via a build-only
  `tsconfig.build.json` (no cross-package aliases) plus a `beforeWriteFile`
  hook in the dts plugin that rewrites any leaked source path back to the
  package name.
- **Source maps now ship.** `dist/index.js.map` and `dist/index.umd.cjs.map`
  are published for both `@vue-select-plus/core` and `@vue-select-plus/vue`.
  Stack traces in consumer apps resolve to original source locations
  instead of minified column numbers.
- **Simplified `@vue-select-plus/styles` exports map.** The redundant
  `./style.css` subpath has been removed. The package now exports only `.`
  pointing at the same file; one canonical path for bundlers, slightly
  faster resolution.
- **Stylesheet now ships inside `@vue-select-plus/vue` as well.** The vue
  package's build step copies `style.css` into its own `dist/` and exposes
  it via three subpaths: `./styles`, `./styles.css`, and `./style.css`.
  Consumers can now do a single install (`npm i @vue-select-plus/vue`) and
  one import (`import '@vue-select-plus/vue/styles.css'`) instead of having
  to also install `@vue-select-plus/styles` separately. This fixes the
  pnpm-strict-mode issue where transitive deps don't hoist into the
  consumer's `node_modules`, breaking the legacy
  `import '@vue-select-plus/styles'` path with a "Failed to resolve" error.
  The legacy package still publishes and resolves identically; the new
  subpath is just a more robust default. All quickstart docs migrated to
  the new path.
