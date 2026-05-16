import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useSelect } from '../useSelect';
import type { SelectOption } from '../../types';

const baseOptions: SelectOption[] = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' }
];

function makeSelect(overrides: Partial<{
    multiple: boolean;
    searchable: boolean;
    model: any;
    disabled: boolean;
    options: SelectOption[];
}> = {}) {
    const modelValue = ref(overrides.model ?? null);
    const disabled = ref(overrides.disabled ?? false);
    const options = ref(overrides.options ?? baseOptions);

    return {
        modelValue,
        ...useSelect({
            options,
            modelValue,
            multiple: overrides.multiple ?? false,
            searchable: overrides.searchable ?? false,
            disabled
        })
    };
}

describe('useSelect', () => {
    it('highlights the selected option on open', () => {
        const { open, highlightedIndex } = makeSelect({ model: 'b' });
        expect(highlightedIndex.value).toBe(-1);
        open();
        expect(highlightedIndex.value).toBe(1);
    });

    it('navigates from the selected option', () => {
        const { onKeyDown, highlightedIndex, isOpen } = makeSelect({ model: 'b' });
        const event = { key: 'ArrowDown', preventDefault: () => { } } as KeyboardEvent;
        onKeyDown(event);
        expect(isOpen.value).toBe(true);
        expect(highlightedIndex.value).toBe(1);
        onKeyDown(event);
        expect(highlightedIndex.value).toBe(2);
    });

    it('selects and closes in single mode', () => {
        const { open, onKeyDown, modelValue, isOpen, visibleOptions } = makeSelect();
        open();
        // On open with no model, the first navigable option is highlighted.
        onKeyDown({ key: 'Enter', preventDefault: () => { } } as KeyboardEvent);
        expect(modelValue.value).toBe(visibleOptions.value[0]!.value);
        expect(isOpen.value).toBe(false);
    });

    it('toggles values in multiple mode without closing', () => {
        const { open, handleSelect, modelValue, isOpen, visibleOptions } =
            makeSelect({ multiple: true, model: [] });
        open();
        handleSelect(visibleOptions.value[0]!);
        expect(modelValue.value).toEqual(['a']);
        expect(isOpen.value).toBe(true);

        handleSelect(visibleOptions.value[1]!);
        expect(modelValue.value).toEqual(['a', 'b']);

        handleSelect(visibleOptions.value[0]!);
        expect(modelValue.value).toEqual(['b']);
    });

    it('clear() resets to undefined/[] depending on mode', () => {
        const single = makeSelect({ model: 'a' });
        single.clear();
        expect(single.modelValue.value).toBeUndefined();

        const multi = makeSelect({ multiple: true, model: ['a', 'b'] });
        multi.clear();
        expect(multi.modelValue.value).toEqual([]);
    });

    it('ignores keydown when disabled', () => {
        const { onKeyDown, isOpen } = makeSelect({ disabled: true });
        onKeyDown({ key: 'ArrowDown', preventDefault: () => { } } as KeyboardEvent);
        expect(isOpen.value).toBe(false);
    });

    it('removes last selection on Backspace in multiple mode with empty search', () => {
        const { onKeyDown, modelValue } = makeSelect({
            multiple: true,
            model: ['a', 'b']
        });
        onKeyDown({ key: 'Backspace', preventDefault: () => { } } as KeyboardEvent);
        expect(modelValue.value).toEqual(['a']);
    });

    it('closes on Escape', () => {
        const { open, onKeyDown, isOpen } = makeSelect();
        open();
        expect(isOpen.value).toBe(true);
        onKeyDown({
            key: 'Escape',
            preventDefault: () => { },
            stopPropagation: () => { }
        } as KeyboardEvent);
        expect(isOpen.value).toBe(false);
    });
});
