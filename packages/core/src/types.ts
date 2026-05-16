/**
 * Public type definitions for Vue Select Plus.
 *
 * Values are typed as `string | number` for stability across SSR and form
 * serialization. If you need object values, store the object under a string id
 * and look it up in your own code via the `@create` or selection events.
 */

export type SelectValue = string | number;

export interface SelectOption {
    /** Stable, unique identifier. Required for selectable options. Omit for pure group headers. */
    value?: SelectValue;
    /** Visible label. */
    label: string;
    /** Disabled options cannot be selected or navigated to via keyboard. */
    disabled?: boolean;
    /** Nested options. Renders as an expandable tree. */
    children?: SelectOption[];
    /** When set, renders this option as a non-selectable group header. */
    group?: string;
}

/**
 * Represents a flattened item in the virtual list. Internal — do not rely on
 * the shape outside of this package.
 */
export interface FlatOption extends SelectOption {
    depth: number;
    isGroup: boolean;
    isCreator?: boolean;
    parentValue?: SelectValue;
    /** Stable react-style key for v-for. */
    key: string | number;
}

export type SelectModelValue = SelectValue | SelectValue[] | undefined | null;
