import { type Ref, type MaybeRefOrGetter, toValue } from 'vue';
import type { SelectOption, SelectModelValue, FlatOption, SelectValue } from '../types';
import { useSelectState } from './useSelectState';
import { useCreator } from './useCreator';
import { useSelection } from './useSelection';
import { useOptions } from './useOptions';
import { useKeyboard } from './useKeyboard';

export interface UseSelectProps {
    options: MaybeRefOrGetter<ReadonlyArray<SelectOption>>;
    /** Writable ref — a `defineModel()` result or a `ref(initial)`. */
    modelValue: Ref<SelectModelValue>;
    multiple: MaybeRefOrGetter<boolean>;
    searchable: MaybeRefOrGetter<boolean>;
    disabled: MaybeRefOrGetter<boolean>;
    /** Built-in client filtering. Pass `false` for server-driven search. @default true */
    filterable?: MaybeRefOrGetter<boolean>;
}

/**
 * Headless engine behind `<VSelect>`. Owns selection state, keyboard
 * navigation, option flattening, and the label lookup map.
 *
 * @example
 * const { isOpen, visibleOptions, handleSelect, onKeyDown } = useSelect({
 *     options: ref(opts),
 *     modelValue: ref(null),
 *     multiple: false,
 *     searchable: false,
 *     disabled: ref(false)
 * });
 */
export function useSelect(props: UseSelectProps) {

    const {
        isOpen,
        searchQuery,
        highlightedIndex,
        open: _open,
        close,
        setHighlight
    } = useSelectState(props.disabled);

    const {
        creatorParentValue,
        startCreator: _startCreator,
        cancelCreator
    } = useCreator();

    const closeWithCleanup = () => {
        close();
        cancelCreator();
    };

    const {
        isSelected,
        handleSelect,
        removeValue,
        removeLast,
        clear
    } = useSelection({
        modelValue: props.modelValue,
        multiple: props.multiple,
        onAfterSelect: closeWithCleanup
    });

    const {
        visibleOptions,
        navigableIndices,
        collapsedValues,
        toggleCollapse,
        labelMap
    } = useOptions({
        options: props.options,
        searchQuery,
        searchable: props.searchable,
        creatorParentValue,
        disabled: props.disabled,
        filterable: props.filterable
    });

    function findOptionIndex(options: ReadonlyArray<FlatOption>, model: SelectModelValue): number {
        if (model === null || model === undefined) return -1;
        const isMulti = toValue(props.multiple);
        return options.findIndex(opt => {
            if (opt.isGroup || opt.isCreator || opt.value === undefined) return false;
            if (isMulti && Array.isArray(model)) {
                return model.some(val => val === opt.value);
            }
            return opt.value === model;
        });
    }

    function open() {
        if (toValue(props.disabled)) return;
        _open();

        const model = toValue(props.modelValue);
        const modelIsEmpty =
            model === undefined ||
            model === null ||
            (Array.isArray(model) && model.length === 0);

        // Skip the O(n) findOptionIndex scan when nothing is selected.
        if (modelIsEmpty) {
            const firstNavigable = navigableIndices.value[0];
            setHighlight(firstNavigable ?? -1);
            return;
        }

        const options = visibleOptions.value;
        let targetIndex = findOptionIndex(options, model);

        if (targetIndex === -1 && navigableIndices.value.length > 0) {
            targetIndex = navigableIndices.value[0] ?? -1;
        }

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

    function startCreator(parentValue: SelectValue) {
        if (collapsedValues.value.has(parentValue)) {
            toggleCollapse(parentValue);
        }
        _startCreator(parentValue);
    }

    const { onKeyDown } = useKeyboard({
        isOpen,
        highlightedIndex,
        visibleOptions,
        navigableIndices,
        creatorParentValue,
        searchQuery,
        multiple: props.multiple,
        searchable: props.searchable,
        disabled: props.disabled,
        collapsedValues,
        open,
        close: closeWithCleanup,
        selectOption: handleSelect,
        toggleCollapse,
        cancelCreator,
        setHighlight,
        removeLastSelection: removeLast
    });

    return {
        isOpen,
        searchQuery,
        /** `aria-activedescendant` target index into `visibleOptions`, or `-1`. */
        highlightedIndex,
        collapsedValues,
        creatorParentValue,
        visibleOptions,
        /** Indices into `visibleOptions` that can receive keyboard highlight. */
        navigableIndices,
        /** `value → label` lookup for rendering tags / single-value displays. */
        labelMap,

        open,
        close: closeWithCleanup,
        toggle: toggleMenu,
        /** WAI-ARIA 1.2 combobox keyboard handler. Wire to `@keydown`. */
        onKeyDown,
        toggleCollapse,
        setHighlight,

        isSelected,
        handleSelect,
        removeValue,
        removeLast,
        clear,

        startCreator,
        cancelCreator
    };
}
