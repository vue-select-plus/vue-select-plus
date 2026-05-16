/**
 * Public type definitions for Vue Select Plus.
 *
 * Values are typed as `string | number` for stability across SSR and form
 * serialization. If you need object values, store the object under a string id
 * and look it up in your own code via the `@create` or selection events.
 */

/**
 * A primitive that uniquely identifies an option. Kept narrow on purpose:
 * objects would not survive `FormData` serialization, SSR cloning, or query-
 * string round trips. For object payloads, store them by id and look them
 * up out-of-band.
 */
export type SelectValue = string | number;

/**
 * Shape of every option (and group header) you pass into the component.
 *
 * Either pass `value` (selectable row) **or** `group` (non-selectable header).
 * Items with `children` render as expandable tree nodes.
 */
export interface SelectOption {
    /** Stable, unique identifier. Required for selectable rows; omit for pure group headers. */
    value?: SelectValue;
    /** Visible label rendered in the trigger, the tags, and the listbox. */
    label: string;
    /** Disabled options cannot be selected or navigated to via keyboard. */
    disabled?: boolean;
    /** Nested options. Renders as an expandable tree. */
    children?: SelectOption[];
    /** When set, renders this option as a non-selectable group header. */
    group?: string;
}

/**
 * Internal: the flattened, depth-tagged shape used inside the virtualized
 * listbox. Returned from `useSelect().visibleOptions` for headless consumers.
 *
 * Do not pass instances of this back into `options` — the engine builds it on
 * the fly from the user-facing `SelectOption[]`.
 */
export interface FlatOption extends SelectOption {
    /** 0-based depth in the tree. */
    depth: number;
    /** `true` when this row is a group header (rendered, not selectable). */
    isGroup: boolean;
    /** `true` when this row is the inline creator-mode input placeholder. */
    isCreator?: boolean;
    /** Value of the tree-node parent (only set on creator and child rows). */
    parentValue?: SelectValue;
    /** Stable v-for key, derived from value, group label, or depth. */
    key: string | number;
}

/**
 * Two-way-bound model value.
 *
 * - Single mode: a single primitive or `undefined`/`null` for "no selection".
 * - Multi mode: an array of primitives (possibly empty).
 *
 * `null` is treated identically to `undefined` for "no selection" — both
 * appear in the wild (FormKit emits `null` on reset, VeeValidate emits
 * `undefined`).
 */
export type SelectModelValue = SelectValue | SelectValue[] | undefined | null;
