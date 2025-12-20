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

    it('should flatten simple options', () => {
        const { visibleOptions } = useOptions({
            options: ref(simpleOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(2);
        expect(visibleOptions.value[0].label).toBe('One');
        expect(visibleOptions.value[0].depth).toBe(0);
    });

    it('should flatten nested options', () => {
        const { visibleOptions } = useOptions({
            options: ref(nestedOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        // Group + Child
        expect(visibleOptions.value).toHaveLength(2);
        expect(visibleOptions.value[0].value).toBe('group1');
        expect(visibleOptions.value[1].value).toBe('1.1');
        expect(visibleOptions.value[1].depth).toBe(1);
    });

    it('should toggle collapse', () => {
        const { visibleOptions, toggleCollapse } = useOptions({
            options: ref(nestedOptions),
            searchQuery: ref(''),
            searchable: false,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        // Initially expanded
        expect(visibleOptions.value).toHaveLength(2);

        // Collapse Group 1
        toggleCollapse('group1');
        expect(visibleOptions.value).toHaveLength(1);
        expect(visibleOptions.value[0].value).toBe('group1');

        // Expand
        toggleCollapse('group1');
        expect(visibleOptions.value).toHaveLength(2);
    });

    it('should filter options', () => {
        const { visibleOptions } = useOptions({
            options: ref(simpleOptions),
            searchQuery: ref('Two'),
            searchable: true,
            creatorParentValue: ref(null),
            disabled: ref(false)
        });

        expect(visibleOptions.value).toHaveLength(1);
        expect(visibleOptions.value[0].label).toBe('Two');
    });
});
