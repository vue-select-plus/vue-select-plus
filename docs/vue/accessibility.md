# Accessibility

`<VSelect>` implements the [WAI-ARIA 1.2 combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) end-to-end. This page enumerates which assistive-technology features are covered and which WCAG success criteria they satisfy.

## ARIA attribute reference

### Combobox surface (button or input)

| Attribute | When | Value |
| :--- | :--- | :--- |
| `role` | always | `"combobox"` |
| `aria-haspopup` | always | `"listbox"` |
| `aria-expanded` | always | `"true"` when menu open, `"false"` otherwise |
| `aria-controls` | always | id of the listbox |
| `aria-activedescendant` | menu open, option highlighted | id of the highlighted option |
| `aria-autocomplete` | when `searchable` | `"list"` |
| `aria-labelledby` | non-searchable | `"{label-id} {value-summary-id}"` |
| `aria-labelledby` | searchable, `label` prop set | label id |
| `aria-describedby` | searchable, input empty, value selected | `"{value-summary-id} ..."` (so the selection is announced when not actively searching) |
| `aria-describedby` | error set | includes the error message id |
| `aria-describedby` | menu open | includes the live-region status id |
| `aria-invalid` | `error` truthy | `"true"` |
| `aria-required` | `required` prop set | `"true"` |
| `aria-busy` | `loading` prop set | `"true"` |
| `aria-disabled` | `disabled` prop set | inherited from native `disabled` attribute |

### Listbox

| Attribute | When | Value |
| :--- | :--- | :--- |
| `role` | always | `"listbox"` |
| `aria-label` or `aria-labelledby` | always | matches the trigger label |
| `aria-multiselectable` | `multiple` prop set | `"true"` |
| `aria-busy` | `loading` set | `"true"` |

### Option

| Attribute | When | Value |
| :--- | :--- | :--- |
| `role` | always | `"option"` |
| `aria-selected` | always | `"true"` if part of the model |
| `aria-disabled` | option's `disabled: true` | `"true"` |
| `aria-level` | row is in a tree (depth > 0 or has children) | depth in the tree (1-based) |
| `aria-setsize` | always | number of navigable siblings |
| `aria-posinset` | always | 1-based position |
| `aria-expanded` | option has `children` | `"true"` when expanded |

### Tag-remove and clear buttons

| Attribute | Value |
| :--- | :--- |
| `aria-label` | "Remove {label}" / "Clear selection" (overridable via `labels` prop) |
| `tabindex` | `"0"` (keyboard-reachable by default) |

## WCAG 2.1 compliance map

| Success Criterion | Level | Covered? | Notes |
| :--- | :---: | :---: | :--- |
| 1.3.1 Info and Relationships | A | ✅ | Roles, labels, and relationships are all in the accessibility tree. |
| 1.3.5 Identify Input Purpose | AA | ✅ | The `autocomplete` prop forwards to the input. |
| 1.4.3 Contrast (Minimum) | AA | ✅* | Default tokens meet 4.5:1 in light and dark mode. *Custom themes are the consumer's responsibility. |
| 1.4.11 Non-text Contrast | AA | ✅ | Focus indicator is 3 px outline at ≥ 3:1 against adjacent colours. |
| 1.4.12 Text Spacing | AA | ✅ | No fixed widths/heights on text containers. |
| 1.4.13 Content on Hover/Focus | AA | ✅ | The dropdown stays open until explicitly closed; can be dismissed via Esc; doesn't obscure the trigger. |
| 2.1.1 Keyboard | A | ✅ | Every interactive element is reachable; full keyboard contract documented in the [API](./api#keyboard). |
| 2.1.2 No Keyboard Trap | A | ✅ | Tab closes the menu and continues form-tab order. Esc closes and returns focus. |
| 2.1.4 Character Key Shortcuts | A | ✅ | No single-character shortcuts that conflict with AT shortcuts. |
| 2.4.3 Focus Order | A | ✅ | Logical: trigger → tags (multi) → indicators → next field. |
| 2.4.7 Focus Visible | AA | ✅ | `:focus-visible` adds a 3 px high-contrast ring. |
| 2.4.11 Focus Not Obscured (Min) | AA | ✅ | Floating UI's `shift` keeps the menu inside the viewport; the trigger never disappears under it. |
| 3.2.1 On Focus | A | ✅ | Focusing the trigger doesn't change context unexpectedly. |
| 3.2.2 On Input | A | ✅ | Selecting an option in single mode closes the menu and returns focus — that's an explicit user action, not "on input". |
| 3.3.1 Error Identification | A | ✅ | `aria-invalid` + visible message + `aria-describedby`. |
| 3.3.2 Labels or Instructions | A | ✅ | The `label` prop is mandatory for `aria-labelledby` to fire — make sure to pass one or set `listboxLabel`. |
| 3.3.3 Error Suggestion | AA | ✅* | The `error` prop accepts any string — write descriptive messages. |
| 4.1.2 Name, Role, Value | A | ✅ | Combobox name = label + selected value. Role + value programmatically determinable. |
| 4.1.3 Status Messages | AA | ✅ | Result counts, loading, and min-search hints announce via a polite `<span role="status" aria-live="polite">`. |

`*` consumer-affected — the component provides the hooks; you provide the content.

## What we explicitly do NOT do

- **Auto-focus options on hover.** Hover changes the highlight (visual), not the screen-reader focus. This avoids surprising AT users.
- **Single-character search-while-closed.** Some comboboxes "type-ahead" while the menu is closed. We don't — it's confusing and conflicts with Tab order. Open the menu first.
- **`aria-pressed` on tag-remove.** It's a button that fires an action, not a toggle.

## Forced colours / Windows High Contrast

When the user has high-contrast mode enabled (Windows or `forced-colors: active`):

- Borders use `CanvasText`.
- Active/selected options use `Highlight` + `HighlightText`.
- The focus ring becomes a solid 2 px `Highlight` outline.
- Icons inherit `CanvasText` so they remain visible.

The relevant rules live in [`packages/styles/src/style.css`](https://github.com/vue-select-plus/vue-select-plus/blob/main/packages/styles/src/style.css) under the `@media (forced-colors: active)` block.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- The menu open/close transition is skipped (instant pop, no slide).
- The loading spinner stops rotating and falls back to a static full-circle outline.
- All `transition` and `animation` durations are forced to 0.01 ms (effectively off, but preserves browser hooks).

## Locale & RTL

- All visual layout uses logical CSS properties (`margin-inline-start`, `padding-block`, etc.) — flip-correct under `[dir="rtl"]` without extra config.
- Text strings come from the `labels` prop — pass localised strings for SR announcements:

    ```ts
    const labels = {
        clear: 'Auswahl löschen',
        removeItem: (l: string) => `${l} entfernen`,
        noResults: 'Keine Treffer.',
        loading: 'Lädt…',
        resultsCount: (n: number) => `${n} Ergebnis${n === 1 ? '' : 'se'} verfügbar.`
    };
    ```

## Testing for accessibility

The repo runs [axe-core](https://github.com/dequelabs/axe-core) (via `@storybook/addon-a11y`) against every Storybook story with the WCAG 2.0 A/AA + 2.1 A/AA + best-practice rule set. If you're integrating `<VSelect>` into a design system, mirror that:

```bash
npm install --save-dev @storybook/addon-a11y
```

```ts
// .storybook/preview.ts
export default {
    parameters: {
        a11y: {
            test: 'todo',
            options: {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                }
            }
        }
    }
};
```
