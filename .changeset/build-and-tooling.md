---
"@vue-select-plus/core": patch
"@vue-select-plus/vue": patch
"@vue-select-plus/styles": patch
---

Build/packaging cleanup.

Public `.d.ts` files no longer leak workspace source paths
(`from '../../core/src/index.ts'`). Fixed via a build-only
`tsconfig.build.json` without the cross-package alias, plus a
`beforeWriteFile` hook in vite-plugin-dts that rewrites any leaked path
back to the package name.

Source maps now ship for both `@vue-select-plus/core` and `@vue-select-plus/vue`,
so consumer stack traces resolve to original source locations instead
of minified columns.

`@vue-select-plus/styles` exports map simplified to a single `.` entry.

The default stylesheet now also ships inside `@vue-select-plus/vue`,
exposed as `@vue-select-plus/vue/styles.css` (plus `./styles` and
`./style.css` aliases). Consumers can now install just the vue package
and import the CSS by subpath — previously the documented
`import '@vue-select-plus/styles'` failed under pnpm strict mode, which
doesn't hoist transitive deps into the consumer's `node_modules`. The
separate `@vue-select-plus/styles` package still publishes the same
file for anyone who prefers to install it explicitly.
