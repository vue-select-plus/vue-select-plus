import { type Ref, toValue } from 'vue';
import type { SelectModelValue, FlatOption } from '../types';

interface UseSelectionProps {
    modelValue: Ref<SelectModelValue>;
    multiple: boolean;
    closeOnSelect?: () => void;
}

export function useSelection({ modelValue, multiple, closeOnSelect }: UseSelectionProps) {

    function isSelected(value: string | number | undefined): boolean {
        if (value === undefined) return false;
        const current = toValue(modelValue);

        if (Array.isArray(current)) {
            return current.includes(value);
        }
        return current === value;
    }

    function handleSelect(option: FlatOption) {
        if (option.disabled || option.isGroup || option.isCreator || option.value === undefined) {
            return;
        }

        if (multiple) {
            const current = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
            const idx = current.indexOf(option.value);

            if (idx > -1) {
                current.splice(idx, 1);
            } else {
                current.push(option.value);
            }
            modelValue.value = current;
        } else {
            modelValue.value = option.value;
            closeOnSelect?.();
        }
    }

    function removeValue(value: string | number) {
        if (Array.isArray(modelValue.value)) {
            modelValue.value = modelValue.value.filter(v => v !== value);
        } else if (modelValue.value === value) {
            modelValue.value = undefined;
        }
    }

    function removeLast() {
        if (!multiple || !Array.isArray(modelValue.value) || modelValue.value.length === 0) return;
        const current = [...modelValue.value];
        current.pop();
        modelValue.value = current;
    }

    return {
        isSelected,
        handleSelect,
        removeValue,
        removeLast
    };
}