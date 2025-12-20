import { type Ref, type MaybeRefOrGetter, toValue } from 'vue';
import type { SelectOption, SelectModelValue } from '../types';
import { useSelectState } from './useSelectState';
import { useCreator } from './useCreator';
import { useSelection } from './useSelection';
import { useOptions } from './useOptions';
import { useKeyboard } from './useKeyboard';

export interface UseSelectProps {
    options: Ref<ReadonlyArray<SelectOption>>;
    modelValue: Ref<SelectModelValue>;
    multiple: boolean;
    searchable: boolean;
    disabled: Ref<boolean>;
}

export function useSelect(props: UseSelectProps) {

    const {
        isOpen,
        searchQuery,
        highlightedIndex,
        open: _open,
        close,
        toggle: _toggle,
        setHighlight
    } = useSelectState(props.disabled);

    // 2. Creator State
    const {
        creatorParentValue,
        startCreator: _startCreator,
        cancelCreator
    } = useCreator();

    const closeWithCleanup = () => {
        close();
        cancelCreator();
    };

    // 3. Selection
    const {
        isSelected,
        handleSelect,
        removeValue,
        removeLast // NEU
    } = useSelection({
        modelValue: props.modelValue,
        multiple: props.multiple,
        closeOnSelect: closeWithCleanup
    });

    // 4. Options
    const {
        visibleOptions,
        navigableIndices,
        collapsedValues,
        toggleCollapse
    } = useOptions({
        options: props.options,
        searchQuery,
        searchable: props.searchable,
        creatorParentValue,
        disabled: props.disabled
    });

    // Helper: Robustly find index
    function findOptionIndex(options: ReadonlyArray<any>, model: any): number {
        if (model === null || model === undefined) return -1;

        return options.findIndex(opt => {
            if (opt.isGroup || opt.isCreator) return false;

            // Multiple Mode
            if (props.multiple && Array.isArray(model)) {
                return model.some(val => String(val) === String(opt.value));
            }
            // Single Mode
            return String(opt.value) === String(model);
        });
    }

    // Open Logic
    function open() {
        if (toValue(props.disabled)) return;
        _open();

        const options = visibleOptions.value;
        const model = toValue(props.modelValue);

        // 1. Try to find the selected item
        let targetIndex = findOptionIndex(options, model);

        // 2. If not found, default to first navigable option (if available)
        if (targetIndex === -1 && navigableIndices.value.length > 0) {
            targetIndex = navigableIndices.value[0] ?? -1;
        }

        // 3. Apply Highlight (Guard against invalid indices or disabled items)
        if (targetIndex !== -1 && !options[targetIndex]?.disabled) {
            setHighlight(targetIndex);
        } else {
            setHighlight(-1);
        }
    }

    function toggleMenu() {
        if (isOpen.value) {
            closeWithCleanup();
        } else {
            open();
        }
    }

    // 5. Action Wrappers
    function startCreator(parentValue: string | number) {
        if (collapsedValues.value.has(parentValue)) {
            toggleCollapse(parentValue);
        }
        _startCreator(parentValue);
    }

    // 6. Keyboard
    const { onKeyDown } = useKeyboard({
        isOpen,
        highlightedIndex,
        visibleOptions,
        navigableIndices,
        creatorParentValue,
        searchQuery,        // NEU
        multiple: props.multiple, // NEU
        searchable: props.searchable, // NEU
        disabled: props.disabled,
        collapsedValues,
        open,
        close: closeWithCleanup,
        selectOption: handleSelect,
        toggleCollapse,
        cancelCreator,
        setHighlight,
        removeLastSelection: removeLast // NEU
    });

    return {
        isOpen,
        searchQuery,
        highlightedIndex,
        collapsedValues,
        creatorParentValue,
        visibleOptions,

        open,
        close: closeWithCleanup,
        toggle: toggleMenu,
        onKeyDown,
        toggleCollapse,

        isSelected,
        handleSelect,
        removeValue,
        removeLast,

        startCreator,
        cancelCreator
    };
}