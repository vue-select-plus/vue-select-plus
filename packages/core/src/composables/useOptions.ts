import { computed, ref, toValue, type Ref, type MaybeRefOrGetter } from 'vue';
import type { SelectOption, FlatOption, SelectValue } from '../types';

interface UseOptionsProps {
    options: MaybeRefOrGetter<ReadonlyArray<SelectOption>>;
    searchQuery: MaybeRefOrGetter<string>;
    searchable: MaybeRefOrGetter<boolean>;
    creatorParentValue: MaybeRefOrGetter<SelectValue | null>;
    disabled: MaybeRefOrGetter<boolean>;
    /**
     * Enables client-side filtering when truthy. Set to `false` for server-driven
     * search (the parent updates `options` based on the `@search` event).
     */
    filterable?: MaybeRefOrGetter<boolean>;
}

const CREATOR_VALUE = '__vsp_creator__' as const;

/**
 * Handles option flattening, filtering, and visibility logic.
 */
export function useOptions({
    options,
    searchQuery,
    searchable,
    creatorParentValue,
    disabled,
    filterable
}: UseOptionsProps) {

    // Annotated explicitly: TypeScript's inference produces a noisy
    // intersection like `Ref<Set<SelectValue> & Omit<Set<SelectValue>, …>>`
    // in IDE tooltips. The explicit `Ref<Set<SelectValue>>` keeps the surface
    // readable for headless consumers.
    const collapsedValues: Ref<Set<SelectValue>> = ref(new Set());

    function toggleCollapse(value: SelectValue | undefined) {
        if (value === undefined) return;
        const next = new Set(collapsedValues.value);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        collapsedValues.value = next;
    }

    function filterTree(nodes: ReadonlyArray<SelectOption>, query: string): SelectOption[] {
        const q = query.toLowerCase();
        const result: SelectOption[] = [];

        for (const node of nodes) {
            const label = node.label?.toLowerCase() ?? '';
            const isMatch = label.includes(q);
            const children = node.children ? filterTree(node.children, query) : [];

            if (isMatch || children.length > 0) {
                result.push({ ...node, children: children.length ? children : node.children });
            }
        }
        return result;
    }

    function flatten(nodes: ReadonlyArray<SelectOption>, depth = 0): FlatOption[] {
        const result: FlatOption[] = [];
        const creatorVal = toValue(creatorParentValue);
        const isDisabled = toValue(disabled);
        const query = toValue(searchQuery);
        const isSearching = toValue(searchable) && query.length > 0;

        for (const node of nodes) {
            const key = node.value ?? `group-${node.group ?? node.label}-${depth}`;
            const isGroup = !!node.group;

            result.push({
                ...node,
                depth,
                isGroup,
                isCreator: false,
                key
            });

            if (creatorVal !== null && node.value === creatorVal && !isDisabled) {
                result.push({
                    label: 'Creator',
                    value: CREATOR_VALUE,
                    depth: depth + 1,
                    isGroup: false,
                    isCreator: true,
                    parentValue: node.value,
                    key: `creator-${node.value}`
                });
            }

            const isCollapsed = node.value !== undefined && collapsedValues.value.has(node.value);

            if (node.children?.length && (!isCollapsed || isSearching)) {
                result.push(...flatten(node.children, depth + 1));
            }
        }
        return result;
    }

    const visibleOptions = computed(() => {
        const opts = toValue(options);
        const query = toValue(searchQuery);
        const allowClientFilter = filterable === undefined ? true : toValue(filterable);

        const filtered = (toValue(searchable) && allowClientFilter && query.length > 0)
            ? filterTree(opts, query)
            : opts;

        return flatten(filtered);
    });

    /**
     * Indices of options that can be highlighted via keyboard. Excludes groups,
     * disabled options, and creator placeholders.
     */
    const navigableIndices = computed(() => {
        const indices: number[] = [];
        const list = visibleOptions.value;
        for (let i = 0; i < list.length; i++) {
            const opt = list[i]!;
            if (opt.disabled || opt.isGroup || opt.isCreator) continue;
            indices.push(i);
        }
        return indices;
    });

    /**
     * Flat label lookup for every value in the tree. O(n) once per options change
     * instead of O(n) per call, which matters in multi-select with many tags.
     */
    const labelMap = computed(() => {
        const map = new Map<SelectValue, string>();
        const walk = (nodes: ReadonlyArray<SelectOption>) => {
            for (const node of nodes) {
                if (node.value !== undefined) map.set(node.value, node.label);
                if (node.children?.length) walk(node.children);
            }
        };
        walk(toValue(options));
        return map;
    });

    return {
        visibleOptions,
        navigableIndices,
        collapsedValues,
        toggleCollapse,
        labelMap
    };
}
