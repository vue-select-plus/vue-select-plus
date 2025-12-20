import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import type { SelectOption, FlatOption } from '../types';

interface UseOptionsProps {
    options: MaybeRefOrGetter<ReadonlyArray<SelectOption>>;
    searchQuery: MaybeRefOrGetter<string>;
    searchable: boolean;
    creatorParentValue: MaybeRefOrGetter<string | number | null>;
    disabled: MaybeRefOrGetter<boolean>;
}

/**
 * Handles option flattening, filtering, and visibility logic.
 */
export function useOptions({
    options,
    searchQuery,
    searchable,
    creatorParentValue,
    disabled
}: UseOptionsProps) {

    const collapsedValues = ref<Set<string | number>>(new Set());

    function toggleCollapse(value: string | number | undefined) {
        if (value === undefined) return;
        if (collapsedValues.value.has(value)) {
            collapsedValues.value.delete(value);
        } else {
            collapsedValues.value.add(value);
        }
    }

    function filterTree(nodes: ReadonlyArray<SelectOption>, query: string): SelectOption[] {
        const q = query.toLowerCase();
        const result: SelectOption[] = [];

        for (const node of nodes) {
            const label = node.label?.toLowerCase() ?? '';
            const isMatch = label.includes(q);
            const children = node.children ? filterTree(node.children, query) : [];

            if (isMatch || children.length > 0) {
                result.push({ ...node, children });
            }
        }
        return result;
    }

    function flatten(nodes: ReadonlyArray<SelectOption>, depth = 0): FlatOption[] {
        const result: FlatOption[] = [];
        const creatorVal = toValue(creatorParentValue);
        const isDisabled = toValue(disabled);
        const query = toValue(searchQuery);
        const isSearching = searchable && query.length > 0;

        for (const node of nodes) {
            const key = node.value ?? `group-${node.group}-${depth}`;
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
                    value: '__creator__',
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

        const filtered = (searchable && query.length > 0)
            ? filterTree(opts, query)
            : opts;

        return flatten(filtered);
    });

    const navigableIndices = computed(() => {
        return visibleOptions.value
            .map((opt, index) => (opt.disabled || opt.isGroup ? -1 : index))
            .filter((i) => i !== -1);
    });

    return {
        visibleOptions,
        navigableIndices,
        collapsedValues,
        toggleCollapse
    };
}