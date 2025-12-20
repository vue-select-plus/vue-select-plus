import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useSelect } from '../useSelect';
import type { SelectOption } from '../../types';

describe('useSelect', () => {
    const options: SelectOption[] = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
    ];

    it('should set highlightedIndex to selected value on open', () => {
        const modelValue = ref('b'); // Selected 'B' (Index 1)
        const disabled = ref(false);
        const optionsRef = ref(options);

        const { open, highlightedIndex } = useSelect({
            options: optionsRef,
            modelValue,
            multiple: false,
            searchable: false,
            disabled
        });

        // Initially -1
        expect(highlightedIndex.value).toBe(-1);

        // Open
        open();

        // Should be 1 (Index of 'b')
        expect(highlightedIndex.value).toBe(1);
    });

    it('should navigate from selected value', () => {
        const modelValue = ref('b'); // Selected 'B' (Index 1)
        const disabled = ref(false);
        const optionsRef = ref(options);

        const { open, onKeyDown, highlightedIndex, isOpen } = useSelect({
            options: optionsRef,
            modelValue,
            multiple: false,
            searchable: false,
            disabled
        });

        // Simulate ArrowDown on CLOSED select
        // This should open it and set highlight to 'b' (1), but NOT move it yet (navigate logic returns after open)
        // Wait, navigate logic: if (!isOpen) { open(); return; }
        // So first ArrowDown just opens.

        const event = { key: 'ArrowDown', preventDefault: () => { } } as KeyboardEvent;
        onKeyDown(event);

        expect(isOpen.value).toBe(true);
        expect(highlightedIndex.value).toBe(1); // Should be B

        // Next ArrowDown
        onKeyDown(event);
        expect(highlightedIndex.value).toBe(2); // Should be C
    });
});
