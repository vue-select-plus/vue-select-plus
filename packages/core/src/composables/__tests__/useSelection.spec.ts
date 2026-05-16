import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { useSelection } from '../useSelection';
import type { FlatOption, SelectModelValue } from '../../types';

const opt = (value: string | number, label = String(value), extra: Partial<FlatOption> = {}): FlatOption => ({
    value,
    label,
    depth: 0,
    isGroup: false,
    isCreator: false,
    key: value,
    ...extra
});

describe('useSelection', () => {
    it('selects in single mode and calls onAfterSelect', () => {
        const modelValue = ref<SelectModelValue>(undefined);
        const onAfterSelect = vi.fn();
        const { handleSelect } = useSelection({ modelValue, multiple: false, onAfterSelect });
        handleSelect(opt('a'));
        expect(modelValue.value).toBe('a');
        expect(onAfterSelect).toHaveBeenCalledOnce();
    });

    it('toggles in multiple mode without calling onAfterSelect', () => {
        const modelValue = ref<SelectModelValue>([]);
        const onAfterSelect = vi.fn();
        const { handleSelect } = useSelection({ modelValue, multiple: true, onAfterSelect });
        handleSelect(opt('a'));
        handleSelect(opt('b'));
        expect(modelValue.value).toEqual(['a', 'b']);
        handleSelect(opt('a'));
        expect(modelValue.value).toEqual(['b']);
        expect(onAfterSelect).not.toHaveBeenCalled();
    });

    it('ignores disabled, group, creator, and undefined-value options', () => {
        const modelValue = ref<SelectModelValue>(undefined);
        const { handleSelect } = useSelection({ modelValue, multiple: false });
        handleSelect(opt('a', 'A', { disabled: true }));
        handleSelect(opt('a', 'A', { isGroup: true }));
        handleSelect(opt('a', 'A', { isCreator: true }));
        handleSelect({ ...opt('a'), value: undefined } as FlatOption);
        expect(modelValue.value).toBeUndefined();
    });

    it('removeValue removes a single value', () => {
        const single = ref<SelectModelValue>('a');
        useSelection({ modelValue: single, multiple: false }).removeValue('a');
        expect(single.value).toBeUndefined();

        const multi = ref<SelectModelValue>(['a', 'b']);
        useSelection({ modelValue: multi, multiple: true }).removeValue('a');
        expect(multi.value).toEqual(['b']);
    });

    it('removeLast pops only in multiple mode', () => {
        const single = ref<SelectModelValue>('a');
        useSelection({ modelValue: single, multiple: false }).removeLast();
        expect(single.value).toBe('a');

        const multi = ref<SelectModelValue>(['a', 'b']);
        useSelection({ modelValue: multi, multiple: true }).removeLast();
        expect(multi.value).toEqual(['a']);
    });

    it('isSelected handles arrays, primitives and missing values', () => {
        const sel = useSelection({
            modelValue: ref<SelectModelValue>(['a', 'b']),
            multiple: true
        });
        expect(sel.isSelected('a')).toBe(true);
        expect(sel.isSelected('z')).toBe(false);
        expect(sel.isSelected(undefined)).toBe(false);
    });

    it('clear() resets the model', () => {
        const single = ref<SelectModelValue>('a');
        useSelection({ modelValue: single, multiple: false }).clear();
        expect(single.value).toBeUndefined();

        const multi = ref<SelectModelValue>(['a', 'b']);
        useSelection({ modelValue: multi, multiple: true }).clear();
        expect(multi.value).toEqual([]);
    });
});
