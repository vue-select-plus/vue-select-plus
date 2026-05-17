// Option values are restricted to primitives so they survive FormData,
// SSR serialisation, and query-string round trips. For object payloads,
// keep them in your own store and use the id here.
export type SelectValue = string | number;

/** A single option (selectable row, group header, or tree node with `children`). */
export interface SelectOption {
    value?: SelectValue;
    label: string;
    disabled?: boolean;
    children?: SelectOption[];
    /** Renders as a non-selectable group header. */
    group?: string;
}

/** Flattened, depth-tagged shape produced internally and exposed via `visibleOptions`. */
export interface FlatOption extends SelectOption {
    /** 0-based depth in the tree. */
    depth: number;
    /** `true` when this row is a group header (rendered, not selectable). */
    isGroup: boolean;
    /** `true` when this row is the inline creator-mode input placeholder. */
    isCreator?: boolean;
    /** Value of the tree-node parent (only set on creator and child rows). */
    parentValue?: SelectValue;
    key: string | number;
}

/**
 * v-model value. Single mode: a primitive or `null`/`undefined`. Multi mode:
 * an array. `null` and `undefined` are both accepted for "no selection" —
 * FormKit emits `null` on reset, VeeValidate emits `undefined`.
 */
export type SelectModelValue = SelectValue | SelectValue[] | undefined | null;
