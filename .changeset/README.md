# Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage version bumps, changelogs, and coordinated releases of the three published packages (`core`, `vue`, `styles`).

The three published packages are kept on the **same version** (a "fixed" group in Changeset terms), so any change to one bumps all three. The internal `playground` and `docs` workspaces are ignored.

## Adding a changeset

When you make a code change that should appear in the next release, run:

```bash
npx changeset
```

It will ask:
1. Which packages changed
2. Whether it's a `patch`, `minor`, or `major` bump
3. A summary line that ends up in the `CHANGELOG.md`

The result is a small markdown file in `.changeset/`. Commit it alongside your code change.

## Releasing

```bash
npx changeset version    # collapses all pending changesets, bumps versions, updates CHANGELOG.md
npm install              # refresh the lockfile
git commit -am "chore: release"
npx changeset publish    # publishes to npm
```

## Conventions

- **patch**: bug fixes, internal refactors, dependency bumps that don't affect the public API.
- **minor**: new props/events/slots, additive type changes, new CSS variables.
- **major**: removing or renaming props/events/slots, changing default behaviour, dropping browser/Vue/Node support.

The public API is documented in [`packages/vue/src/index.ts`](../packages/vue/src/index.ts) and [`packages/core/src/index.ts`](../packages/core/src/index.ts) — only those exports follow semver.
