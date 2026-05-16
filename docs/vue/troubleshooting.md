# Troubleshooting

Common issues, their causes, and the fastest fix.

[[toc]]

## My dropdown is clipped / hidden behind something

**Symptom:** The menu opens but gets cut off by a parent with `overflow: hidden`, `transform`, or a high `z-index` sibling.

**Cause:** The menu was rendered inside a clipping ancestor.

**Fix:** Make sure `teleport` is on (it's the default). If you've set `:teleport="false"` for some reason, switch back to `true` or to a specific container that lives outside the clipping ancestor.

```vue
<!-- ok in most apps -->
<VSelect ... />                  <!-- teleports to <body> -->

<!-- inside a <dialog showModal()> use the dialog as target -->
<VSelect :teleport="dialogRef" ... />
```

## My dropdown is hidden behind a modal

**Symptom:** A modal opened with `<dialog>.showModal()` sits in the browser's top layer. The dropdown, teleported to `<body>`, is *behind* it.

**Fix:** Teleport into the dialog instead.

```vue
<VSelect :teleport="dialogRef" ... />
```

## The dropdown flips dark when Tailwind does (and you didn't want that)

**Symptom:** Tailwind's `.dark` class on `<html>` toggles your own dark theme, and Vue Select Plus jumps to its dark variant at the same time, breaking your colour story.

**Why:** Until v1.0 the default theme listens to both `.vsp-dark` and `.dark`. The latter is there for backward compatibility but collides with Tailwind, which owns `.dark` by default.

**Fixes, pick one:**

1. **Use `.vsp-dark` only and keep `.dark` for Tailwind:**

    ```html
    <html class="dark">                  <!-- Tailwind -->
    <html class="dark vsp-dark">         <!-- both -->
    <html class="vsp-dark">              <!-- VSP dark, Tailwind stays light -->
    ```

2. **Override the variables in your own scope** — gives you full control and ignores both classes:

    ```css
    :root.your-app-dark {
        --vs-bg: #1f2937;
        --vs-text: #f9fafb;
        --vs-border: #374151;
        /* …and the rest of the tokens you want to override */
    }
    ```

3. **Disable Tailwind's `.dark` class behaviour entirely** (Tailwind config: `darkMode: 'media'` or a custom selector).

The `.dark` mapping will be removed in v1.0. Today it's still in `@vue-select-plus/styles` to keep upgrade pain low for early adopters.

## The label is read as just "combobox" with no value

**Symptom:** Screen reader announces "Choose a fruit, combobox, collapsed" — but not the selected value.

**Cause:** You probably wrote your own combobox or removed the `<span :id="…-value">` summary. The component wires both the label and the value summary into `aria-labelledby`.

**Fix:** Keep the default markup. If you're using the headless `@vue-select-plus/core`, recreate the labelledby chain yourself — see the [core API reference](../core/api).

## `aria-labelledby` references a missing id

**Symptom:** axe reports `aria-labelledby` points to nonexistent ids.

**Cause:** Multiple `<VSelect>` instances share the same `id` prop, or you pass `:id="undefined"`.

**Fix:** Either omit the `id` prop entirely (the component generates a stable one via `useId()`), or pass a unique string per instance.

## SSR / Nuxt: hydration mismatch warning

**Symptom:** `[Vue warn]: Hydration node mismatch` pointing at the combobox id.

**Cause:** You're passing a non-deterministic `id` (e.g. `Math.random()`).

**Fix:** Omit the `id` prop or use a stable slug derived from your data.

## Form data doesn't include my select value

**Symptom:** `new FormData(form).getAll('fruit')` is empty even though something is selected.

**Cause:** The `name` prop isn't set on `<VSelect>`.

**Fix:**

```vue
<VSelect v-model="value" :options="options" name="fruit" />
```

`name` enables the hidden inputs that participate in `<form>` submission.

## My required field still submits when empty

**Symptom:** You set `required` but the browser submits the form anyway.

**Cause:** You disabled the built-in validation, *or* the form is submitted programmatically (which bypasses validation).

**Fix:**

- Make sure `validateOnSubmit` isn't set to `false`.
- Trigger validation explicitly when submitting programmatically:

    ```ts
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    ```

## My required validation tooltip points at nothing

**Symptom:** The browser's native validation balloon appears in the corner, not on the trigger.

**Cause:** The validation surface (a 1×1 invisible input) lives next to the control. The browser anchors the tooltip to the actual element with the validity error.

**Fix:** This is correct behaviour, but if you'd rather use a custom error UI:

```vue
<VSelect :validate-on-submit="false" :error="myErrorMessage" required />
```

Then handle validation yourself via VeeValidate, FormKit, or a manual check.

## Searchable input doesn't open on click

**Symptom:** Clicking the search input does nothing; you have to use the keyboard.

**Cause:** A custom parent component is calling `stopPropagation()` on click events before they reach the combobox.

**Fix:** Allow click events to reach the combobox, or call `selectRef.value.open()` from your handler.

## My options aren't filtered when I type

**Symptom:** Typing in the searchable input doesn't narrow the list.

**Cause:** `filterable` is `false` (you're driving server-side search) but you didn't update `options` based on `@search`.

**Fix:** Either set `filterable: true` (default) for client filtering, or listen to `@search` and update `options` yourself:

```ts
function onSearch(q: string) {
    options.value = allOptions.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
}
```

## Opening the menu with a huge list feels slow

**Symptom:** With 5 000+ options, clicking the trigger takes a perceptible moment before the menu appears.

**Why:** Opening flattens the option tree once (so the virtualizer knows the row count, navigable indices, and label map). The cost scales linearly with the option count — roughly 10–20 ms in production builds, but **5–10× more in Vite/Vue dev mode** because of reactivity-tracking instrumentation.

**Fixes, in order of effort:**

1. **Test in a production build.** Most "slow" reports vanish once dev-mode overhead is gone. Run `npm run build && npm run preview` for the playground, or visit the deployed docs site.

2. **Reduce the static option count** with server-side search:

    ```vue
    <VSelect
        :options="results"        <!-- 30 items, not 5000 -->
        :loading="isFetching"
        :filterable="false"
        :min-search-length="2"
        :search-debounce="300"
        searchable
        @search="fetch"
    />
    ```

3. **Trim the option payload.** `SelectOption` only reads `value`, `label`, `disabled`, `children`, `group`. Anything else (descriptions, metadata) is cloned during flattening and slows the open. Look those up by `value` from a separate map in your render slot.

Expected order of magnitude (production build, mid-range laptop):

| Option count | Open time |
| ---: | :--- |
| 100 | < 1 ms |
| 1 000 | ~ 5 ms |
| 10 000 | ~ 50 ms |
| 50 000 | ~ 300 ms — consider async/server search |

## The dropdown jumps when I scroll

**Symptom:** While scrolling the page, the menu briefly lags behind the trigger before snapping back.

**Cause:** Floating UI's `autoUpdate` runs on scroll, but the position computation isn't instant under heavy CPU load.

**Fix:** This is usually browser-perf related, not the component. If it's bad on a specific page:

- Reduce the number of simultaneous `<VSelect>` instances on screen.
- Close the menu before scroll (we do this automatically on Tab/Escape).

## Tag-remove buttons are noisy in Tab order

**Symptom:** With many tags, tabbing through the form hits every tag-remove button.

**Cause:** Each tag-remove is keyboard-reachable on purpose — that's the WCAG-compliant default.

**Workaround:** Use `<style>` to hide them from non-mouse users, but be aware this breaks WCAG 2.1.1 ("Keyboard"):

```css
.vue-select-tag-remove {
    /* DON'T do this on accessibility-sensitive sites */
    display: none;
}
```

A better fix is a roving-tabindex pattern — we plan to ship this in a future minor.

## My selected value renders as a raw id

**Symptom:** The trigger shows `"u-123"` instead of `"Alice"`.

**Cause:** The option for that value isn't in `options` yet (probably async-fetched).

**Fix:** See the ["Restoring the selected value"](./recipes#restoring-the-selected-value-when-options-arrive-late) recipe. Either pre-seed the options array or use the `value` slot.

## TypeScript: "Type 'X' is not assignable to type 'SelectModelValue'"

**Symptom:** You bind an object to `v-model` and TypeScript complains.

**Cause:** `SelectModelValue` is `string | number | (string | number)[] | undefined | null` — object values aren't supported yet (planned for `2.0`).

**Fix:** See the ["Object values" recipe](./recipes#object-values-workaround-until-generics-land).

## Vitest: "Cannot read properties of undefined (reading 'getBoundingClientRect')"

**Symptom:** Tests fail with a DOM-API error.

**Cause:** jsdom doesn't implement `ResizeObserver`, `getBoundingClientRect` (with sensible defaults), or `scrollTo`. Floating UI and TanStack Virtual touch all three.

**Fix:** Add the stubs we use in our own test suite:

```ts
// vitest.setup.ts
class ResizeObserverStub { observe(){} unobserve(){} disconnect(){} }
globalThis.ResizeObserver ??= ResizeObserverStub as any;
Element.prototype.scrollTo ??= function () {};
```

See [`packages/vue/src/__tests__/setup.ts`](https://github.com/vue-select-plus/vue-select-plus/blob/main/packages/vue/src/__tests__/setup.ts) in the repo for the full setup.

## Tests open then immediately close the menu

**Symptom:** `await trigger.click(); expect(listbox.exists()).toBe(true)` — fails.

**Cause:** Two click handlers fight each other (an old bug that's fixed in 1.0). If you see this on `< 1.0`, upgrade.

## I still need help

- Open an issue: <https://github.com/vue-select-plus/vue-select-plus/issues>
- Search the [Storybook stories](https://vue-select-plus.github.io/storybook/) — every prop has a working example.
- Read the [API reference](./api).
