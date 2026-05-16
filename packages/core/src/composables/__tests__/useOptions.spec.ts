import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useOptions } from '../useOptions';
import type { SelectOption } from '../../types';

describe('useOptions', () => {
    const simpleOptions: SelectOption[] = [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' }
    ];

    const nestedOptions: SelectOption[] = [
        {
            value: 'group1',
            label: 'Group 1',
            children: [
                { value: '1.1', label: 'Child 1.1' }
            ]
        }
    ];

    it('flattens simple options', () => {
        const { visibleOptions } = useOptions({
            options: ref(simpleOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(2);
        expect(visibleOptions.value[0]!.label).toBe('One');
        expect(visibleOptions.value[0]!.depth).toBe(0);
    });

    it('flattens nested options', () => {
        const { visibleOptions } = useOptions({
            options: ref(nestedOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(2);
        expect(visibleOptions.value[0]!.value).toBe('group1');
        expect(visibleOptions.value[1]!.value).toBe('1.1');
        expect(visibleOptions.value[1]!.depth).toBe(1);
    });

    it('toggles collapse', () => {
        const { visibleOptions, toggleCollapse } = useOptions({
            options: ref(nestedOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(2);

        toggleCollapse('group1');
        expect(visibleOptions.value).toHaveLength(1);
        expect(visibleOptions.value[0]!.value).toBe('group1');

        toggleCollapse('group1');
        expect(visibleOptions.value).toHaveLength(2);
    });

    it('filters options', () => {
        const { visibleOptions } = useOptions({
            options: ref(simpleOptions),
            searchQuery: ref('Two'),
            searchable: true,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(1);
        expect(visibleOptions.value[0]!.label).toBe('Two');
    });

    it('excludes groups, disabled and creators from navigableIndices', () => {
        const opts: SelectOption[] = [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', disabled: true },
            { group: 'Group', label: 'g' },
            { value: 'c', label: 'C' }
        ];

        const { navigableIndices, visibleOptions } = useOptions({
            options: ref(opts),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(4);
        expect(navigableIndices.value).toEqual([0, 3]);
    });

    it('builds a labelMap that resolves nested values', () => {
        const { labelMap } = useOptions({
            options: ref(nestedOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(labelMap.value.get('group1')).toBe('Group 1');
        expect(labelMap.value.get('1.1')).toBe('Child 1.1');
    });
});
