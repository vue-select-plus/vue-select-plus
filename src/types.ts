/**
 * Core definitions for the Select component.
 */

export interface SelectOption {
    value?: string | number;
    label: string;
    disabled?: boolean;
    children?: SelectOption[];
    group?: string;
    [key: string]: any;
}

/**
 * Represents a flattened item in the virtual list.
 * Can be a real option, a group header, or a temporary creator row.
 */
export interface FlatOption extends SelectOption {
    depth: number;
    isGroup: boolean;
    isCreator?: boolean;
    parentValue?: string | number;
}

export type SelectModelValue = string | number | (string | number)[] | undefined;