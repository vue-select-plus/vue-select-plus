---
"@vue-select-plus/vue": patch
---

New `creatable` prop on `<VSelect>` (default `false`). The inline `+`
handle on tree nodes — and the matching keyboard / `@create` flow —
now only renders when this prop is set. Listening to `@create` alone
is no longer enough.

This closes a UX hole: in 0.1.x the `+` button rendered on every
tree node that had children, whether or not the consumer was wired
up to handle `@create`. Apps that hadn't opted in still showed a
button that did nothing on click.

**Behaviour change.** If you were already using `@create`, add
`creatable` to keep the handles visible:

```vue
<VSelect :options="tree" creatable @create="handleCreate" />
```

Pre-1.0 patch — semver permits.
