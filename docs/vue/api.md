# `<VSelect>` API Reference

## Props

### Core

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number \| (string \| number)[] \| null` | `undefined` | Bound via `v-model`. Array in `multiple` mode. |
| `options` | `ReadonlyArray<SelectOption>` | — *(required)* | Option tree (see [`SelectOption`](#selectoption)). |
| `label` | `string` | — | Visible label. Also drives the listbox's accessible name. |
| `placeholder` | `string` | `'Select...'` | Text shown when nothing is selected. |
| `multiple` | `boolean` | `false` | Enables multi-select with tags. |
| `searchable` | `boolean` | `false` | Renders a text input that filters options. |
| `disabled` | `boolean` | `false` | Disables the entire control. |
| `clearable` | `boolean` | `false` | Adds a clear (×) button when a value is selected. |
| `required` | `boolean` | `false` | Sets `aria-required="true"` and (with `validateOnSubmit`) blocks form submission while empty. |
| `validateOnSubmit` | `boolean` | `true` | Enables native HTML5 form validation. Set to `false` to delegate to your own validation library. |
| `validationMessage` | `string` | `'Please select an item.'` | Custom message for the native validation tooltip. |
| `error` | `string` | — | Error message; sets `aria-invalid` and links via `aria-describedby`. |
| `id` | `string` | `auto` (SSR-safe via `useId`) | Root id; used to derive the trigger, listbox, label, error and status ids. |
| `name` | `string` | — | When set, hidden `<input>`s are emitted for native form submission. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size variant. |
| `autocomplete` | `string` | `'off'` | Forwarded to the searchable input. Use `'country'`, `'email'`, etc. for browser autofill. |
| `inputmode` | `'text' \| 'search' \| 'numeric' \| 'email' \| ...` | — | Forwarded to the searchable input as a soft-keyboard hint on mobile. |

### Search & async

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `filterable` | `boolean` | `true` | Disable client-side filtering when handling search server-side. |
| `minSearchLength` | `number` | `0` | Suppress `@search` and show a hint until the query reaches this length. |
| `searchDebounce` | `number` *(ms)* | `0` | Debounce window for the `@search` event. The input itself stays responsive. |
| `loading` | `boolean` | `false` | Shows a spinner, sets `aria-busy="true"`, announces "Loading…". |

### Positioning

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placement` | `Placement` | `'bottom-start'` | Preferred placement; auto-flips when no space is available. |
| `teleport` | `boolean \| string \| HTMLElement` | `true` | `true` teleports the menu to `<body>`; `false` renders inline; a string is treated as a CSS selector. |
| `maxMenuHeight` | `number` *(px)* | `320` | Hard cap on menu height; viewport bounds always win. |
| `itemHeight` | `number` *(px)* | `40` | Row height used by the virtualizer. |

### Localization

| Prop | Type | Description |
| :--- | :--- | :--- |
| `listboxLabel` | `string` | Overrides the listbox's accessible label. Falls back to `label`. |
| `labels` | `VSelectLabels` | Override every screen-reader string (see below). |

```ts
interface VSelectLabels {
    clear?: string;                          // "Clear selection"
    removeItem?: (label: string) => string;  // "Remove Apple"
    noResults?: string;                      // "No results."
    addChild?: string;                       // "Add child item"
    resultsCount?: (n: number) => string;    // "3 results available."
    loading?: string;                        // "Loading…"
    typeToSearch?: (min: number) => string;  // "Type at least 2 characters to search."
}
```

## Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:modelValue` | `SelectModelValue` | Standard `v-model` update. |
| `open` | — | Menu opened. |
| `close` | — | Menu closed (any cause). |
| `search` | `string` | Debounced search query. Use with `:filterable="false"` for server-side search. |
| `create` | `{ parent, value }` | Creator-mode submission. |

## Exposed methods

Accessible via template ref (`ref="mySelect"` → `mySelect.value.open()`):

| Method | Description |
| :--- | :--- |
| `open()` | Open the listbox. |
| `close()` | Close the listbox. |
| `focus()` | Move focus back to the trigger (button or input, depending on `searchable`). |
| `clear()` | Reset the model (`undefined` in single mode, `[]` in multi). |

## Slots

| Slot | Scope | Description |
| :--- | :--- | :--- |
| `value` | `{ value, label }` | Replaces the displayed single value. |
| `option` | `{ option }` | Replaces an option's label cell. |
| `group` | `{ group }` | Replaces a group header. |
| `empty` | — | Shown when `visibleOptions` is empty (after `loading`/min-search states). |
| `loading` | — | Replaces the in-menu loading state. |
| `loading-icon` | — | Replaces the spinner glyph next to the trigger. |
| `hint` | `{ min }` | Replaces the "type at least X characters" hint. |
| `trigger-icon` | `{ isOpen }` | Replaces the chevron in the trigger. |
| `toggle-icon` | `{ collapsed, option }` | Replaces the tree expand/collapse glyph. |
| `add-icon` | `{ option }` | Replaces the "+" glyph next to expandable rows. |
| `creator` | `{ cancel }` | Replaces the inline create-input row. |

## Keyboard

| Key | Effect |
| :--- | :--- |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Move highlight to next/previous option (wraps). |
| <kbd>Alt</kbd> + <kbd>↓</kbd> / <kbd>↑</kbd> | Open / close menu. |
| <kbd>PageDown</kbd> / <kbd>PageUp</kbd> | Jump 10 items. |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last option. |
| <kbd>→</kbd> | Expand current tree node. |
| <kbd>←</kbd> | Collapse current tree node, or jump to its parent. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Select the highlighted option. |
| <kbd>Backspace</kbd> | In multi mode with an empty search input (or no input at all): remove the last selected tag. |
| <kbd>Escape</kbd> | Close the menu, return focus to the trigger. |
| <kbd>Tab</kbd> | Close the menu and continue tab order. |

## Accessibility

The component implements the [WAI-ARIA 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

- `role="combobox"` on the focusable element (`<button>` or `<input>`), with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- `aria-autocomplete="list"` when `searchable`.
- `role="listbox"` on the popup, with `aria-multiselectable` in multi mode.
- Each option has `role="option"`, `aria-selected`, `aria-setsize`, `aria-posinset`, `aria-level`, and (for tree nodes) `aria-expanded`.
- A polite live region announces result counts, loading, and below-min-search hints.
- Tag-remove buttons are reachable via Tab with `aria-label="Remove {label}"`.
- Errors are linked via `aria-invalid` + `aria-describedby`.
- All animations respect `prefers-reduced-motion`.
- Windows High Contrast / `forced-colors` is fully styled with system colours.

### SelectOption

```ts
interface SelectOption {
    value?: string | number;  // required for selectable rows; omit for group-only headers
    label: string;
    disabled?: boolean;
    children?: SelectOption[];
    group?: string;           // when set, this row renders as a non-selectable group header
}
```

## CSS variables

Override on `:root`, `.dark`, or any ancestor. Defaults shown below.

```css
:root {
    --vs-primary:        #2563eb;
    --vs-primary-hover:  #1d4ed8;
    --vs-danger:         #dc2626;
    --vs-bg:             #ffffff;
    --vs-bg-elevated:    #ffffff;
    --vs-bg-subtle:      #f9fafb;
    --vs-bg-hover:       #f3f4f6;
    --vs-text:           #111827;
    --vs-text-muted:     #6b7280;
    --vs-border:         #d1d5db;
    --vs-border-hover:   #9ca3af;
    --vs-selected-bg:    #dbeafe;
    --vs-selected-text:  #1e40af;
    --vs-tag-bg:         #eef2ff;
    --vs-tag-text:       #3730a3;
    --vs-focus-ring:     0 0 0 3px rgba(37, 99, 235, 0.45);
    --vs-radius:         6px;
    --vs-z-menu:         50;
    --vs-control-height: 2.5rem;
    --vs-font-size:      0.875rem;
}
```

### Theming with classes

A dark theme kicks in automatically via `prefers-color-scheme`. To force a theme, set the `light` or `dark` class on any ancestor.

If your app already uses `.dark` for unrelated theming (e.g. Tailwind), use the namespaced **`.vsp-dark`** class instead — both are supported and equivalent.

```html
<!-- Either of these works -->
<html class="dark">      <!-- collides with Tailwind's .dark mode -->
<html class="vsp-dark">  <!-- recommended when Tailwind is in play -->
```
