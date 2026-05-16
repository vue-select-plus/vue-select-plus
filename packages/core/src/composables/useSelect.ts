import { type Ref, toValue } from 'vue';
import type { SelectOption, SelectModelValue, FlatOption, SelectValue } from '../types';
import { useSelectState } from './useSelectState';
import { useCreator } from './useCreator';
import { useSelection } from './useSelection';
import { useOptions } from './useOptions';
import { useKeyboard } from './useKeyboard';

/**
 * Configuration accepted by {@link useSelect}.
 *
 * All `Ref<…>` inputs are read with `toValue`, so plain refs and shallow refs
 * both work. Static-by-design configuration (`multiple`, `searchable`) is
 * intentionally non-reactive — flipping these at runtime is not supported.
 */
export interface UseSelectProps {
    /** The option tree (flat or nested via `children`). */
    options: Ref<ReadonlyArray<SelectOption>>;
    /**
     * Two-way-bound model. Set this to a `defineModel<SelectModelValue>()`
     * ref when building a Vue component, or a `ref(initial)` otherwise.
     */
    modelValue: Ref<SelectModelValue>;
    /** Whether the consumer renders multi-select UI (the model becomes an array). */
    multiple: boolean;
    /** Whether the consumer renders a text-search input. */
    searchable: boolean;
    /** Disables open/keyboard handling. Reactive. */
    disabled: Ref<boolean>;
    /**
     * Enables built-in client-side filtering. Set to `ref(false)` for
     * server-driven search — the parent listens to changes on `searchQuery`
     * and replaces `options` themselves.
     * @default ref(true)
     */
    filterable?: Ref<boolean>;
}

/**
 * Headless engine behind `<VSelect>` — selection state, keyboard navigation,
 * option flattening (incl. tree collapse + creator-row injection), and a
 * pre-built label lookup map.
 *
 * @example
 * ```ts
 * const { isOpen, visibleOptions, handleSelect, onKeyDown } = useSelect({
 *     options: ref(opts),
 *     modelValue: ref(null),
 *     multiple: false,
 *     searchable: false,
 *     disabled: ref(false)
 * });
 * ```
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
        return options.findIndex(opt => {
            if (opt.isGroup || opt.isCreator || opt.value === undefined) return false;
            if (props.multiple && Array.isArray(model)) {
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

        // Skip the O(n) full-options scan when nothing is selected — for large
        // option lists (5k+ items) this halves the work done on every open.
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
        /** `true` while the listbox is open. Read-write. */
        isOpen,
        /** Current search query string. Read-write; clearing this resets filtering. */
        searchQuery,
        /**
         * Index into `visibleOptions` of the currently highlighted row (the
         * `aria-activedescendant` target). `-1` when no row is highlighted.
         */
        highlightedIndex,
        /** Set of tree-node values that are currently collapsed. Read-write. */
        collapsedValues,
        /** Parent value of the active creator-mode input, or `null` when inactive. */
        creatorParentValue,
        /**
         * Flattened, filtered, collapse-aware option list. Recomputed when
         * any of `options`, `searchQuery`, or `collapsedValues` changes.
         */
        visibleOptions,
        /**
         * Indices into `visibleOptions` of rows that can receive keyboard
         * highlight (excludes groups, disabled rows, the creator placeholder).
         */
        navigableIndices,
        /**
         * Flat `value → label` lookup built once per options change. Use this
         * to render selected tags or single-value displays in O(1).
         */
        labelMap,

        /**
         * Open the listbox. No-op when `disabled`. Also pre-highlights the
         * currently-selected option (or the first navigable one).
         */
        open,
        /** Close the listbox and cancel any active creator-mode input. */
        close: closeWithCleanup,
        /** Toggle open/closed. */
        toggle: toggleMenu,
        /**
         * Keyboard handler covering the full WAI-ARIA 1.2 combobox contract.
         * Wire to `@keydown` on your root element.
         */
        onKeyDown,
        /** Expand / collapse a tree node by its `value`. */
        toggleCollapse,
        /** Move the active descendant to an index in `visibleOptions`. */
        setHighlight,

        /** Predicate: is this value part of the current model? */
        isSelected,
        /**
         * Apply a selection. In multi mode this toggles the value;
         * in single mode it sets the value and calls `close()`.
         */
        handleSelect,
        /** Remove one value from the model. */
        removeValue,
        /** Pop the last value from a multi-mode model. No-op otherwise. */
        removeLast,
        /** Reset the model: `undefined` in single mode, `[]` in multi mode. */
        clear,

        /**
         * Start the inline creator under a tree node. Auto-expands the parent
         * first if it's currently collapsed.
         */
        startCreator,
        /** Dismiss the active creator-mode input. */
        cancelCreator
    };
}
