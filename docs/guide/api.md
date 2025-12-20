# API Reference

## Props

The `VSelect` component accepts the following props:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **modelValue** | `any` \| `any[]` | `null` | The value of the selected option(s). Supports `v-model`. |
| **options** | `SelectOption[]` | `[]` | Array of options to display. Supports nested groups via `children`. |
| **label** | `string` | `undefined` | Label text displayed above the select input. |
| **placeholder** | `string` | `'Select...'` | Placeholder text when no option is selected. |
| **multiple** | `boolean` | `false` | Enables multi-selection mode. Values are displayed as tags. |
| **searchable** | `boolean` | `false` | Enables search/filter functionality. |
| **disabled** | `boolean` | `false` | Disables the entire component. |
| **id** | `string` | `auto` | Unique ID for the component (ARIA). |
| **error** | `string` | `undefined` | Error message to display below the input (adds `has-error` class). |
| **onCreate** | `(payload: { parent: any, value: string }) => void` | `undefined` | Callback for "Creator Mode" when adding new items. |

### Option Interface
```typescript
interface SelectOption {
    label: string
    value: string | number
    disabled?: boolean
    children?: SelectOption[] // For nested groups
}
```

## Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| **update:modelValue** | `any` | Emitted when selection changes. |
| **create** | `{ parent, value }` | Emitted when a new item is created (Creator Mode). |

## Slots

| Slot | Scope | Description |
| :--- | :--- | :--- |
| **option** | `{ option }` | Custom content for each option in the dropdown. |
| **value** | `{ value, label }` | Custom content for the selected value (single mode). |
| **empty** | `-` | Content displayed when no options match filter. |
| **trigger-icon** | `{ isOpen }` | Icon displayed in the trigger (arrow/chevron). |
| **group** | `{ group }` | Header content for option groups. |
| **creator** | `{ cancel }` | Custom input area for Creator Mode. |
| **toggle-icon** | `{ collapsed, option }` | Icon for expanding/collapsing groups. |
| **add-icon** | `{ option }` | Icon for adding children (Creator Mode). |

## CSS Variables

You can customize the appearance by overriding these CSS Custom Properties:

```css
:root {
  --vs-primary: #3b82f6;
  --vs-danger: #ef4444;
  --vs-border: #d1d5db;
  --vs-bg: #ffffff;
}
```
