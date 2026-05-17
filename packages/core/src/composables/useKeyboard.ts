import { toValue, type Ref, type MaybeRefOrGetter } from 'vue';
import type { FlatOption, SelectValue } from '../types';

interface UseKeyboardProps {
    isOpen: Ref<boolean>;
    highlightedIndex: Ref<number>;
    visibleOptions: Ref<FlatOption[]>;
    navigableIndices: Ref<number[]>;
    creatorParentValue: Ref<SelectValue | null>;
    searchQuery: Ref<string>;
    multiple: MaybeRefOrGetter<boolean>;
    searchable: MaybeRefOrGetter<boolean>;
    disabled: MaybeRefOrGetter<boolean>;

    open: () => void;
    close: () => void;
    selectOption: (option: FlatOption) => void;
    toggleCollapse: (value: SelectValue) => void;
    cancelCreator: () => void;
    setHighlight: (index: number) => void;
    removeLastSelection: () => void;
    clear: () => void;
    collapsedValues: Ref<Set<SelectValue>>;
}

export function useKeyboard({
    isOpen,
    highlightedIndex,
    visibleOptions,
    navigableIndices,
    creatorParentValue,
    searchQuery,
    multiple,
    searchable,
    disabled,
    open,
    close,
    selectOption,
    toggleCollapse,
    cancelCreator,
    setHighlight,
    removeLastSelection,
    clear,
    collapsedValues
}: UseKeyboardProps) {

    function navigate(direction: 'next' | 'prev', step: number = 1, allowWrap: boolean = true) {
        if (!isOpen.value) {
            open();
            return;
        }
        const indices = navigableIndices.value;
        if (!indices.length) return;

        const currentPos = indices.indexOf(highlightedIndex.value);
        let nextPos: number;

        if (direction === 'next') {
            if (currentPos === -1) {
                nextPos = 0;
            } else if (allowWrap) {
                nextPos = (currentPos + step) % indices.length;
            } else {
                nextPos = Math.min(currentPos + step, indices.length - 1);
            }
        } else {
            if (currentPos === -1) {
                nextPos = indices.length - 1;
            } else if (allowWrap) {
                nextPos = ((currentPos - step) % indices.length + indices.length) % indices.length;
            } else {
                nextPos = Math.max(currentPos - step, 0);
            }
        }

        const targetIndex = indices[nextPos];
        if (targetIndex !== undefined) {
            setHighlight(targetIndex);
        } else {
            setHighlight(indices[0] ?? -1);
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (toValue(disabled)) return;

        // Creator input owns its own keystrokes; just allow Escape to bubble.
        if (creatorParentValue.value !== null) {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancelCreator();
            }
            return;
        }

        switch (e.key) {
            case 'Backspace':
                // Multi: pop the last tag. Single: clear the value. In both
                // cases only when the search input is empty, so we don't
                // hijack the user's normal text editing.
                if (searchQuery.value.length === 0) {
                    if (toValue(multiple)) {
                        removeLastSelection();
                    } else {
                        clear();
                    }
                }
                break;

            case ' ':
                if (toValue(searchable) && isOpen.value) {
                    // Allow native space typing when search input is focused.
                    break;
                }
                e.preventDefault();
                if (isOpen.value && highlightedIndex.value > -1) {
                    const opt = visibleOptions.value[highlightedIndex.value];
                    if (opt && !opt.disabled) selectOption(opt);
                } else if (!isOpen.value) {
                    open();
                }
                break;

            case 'Enter':
                if (!isOpen.value) {
                    e.preventDefault();
                    open();
                    break;
                }
                if (highlightedIndex.value > -1) {
                    e.preventDefault();
                    const opt = visibleOptions.value[highlightedIndex.value];
                    if (opt && !opt.disabled) selectOption(opt);
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                if (e.altKey && !isOpen.value) {
                    open();
                    break;
                }
                navigate('next');
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (e.altKey && isOpen.value) {
                    close();
                    break;
                }
                navigate('prev');
                break;

            case 'PageDown':
                e.preventDefault();
                navigate('next', 10, false);
                break;

            case 'PageUp':
                e.preventDefault();
                navigate('prev', 10, false);
                break;

            case 'Home':
                if (toValue(searchable) && isOpen.value) return;
                e.preventDefault();
                if (isOpen.value && navigableIndices.value.length > 0) {
                    setHighlight(navigableIndices.value[0] ?? -1);
                }
                break;

            case 'End':
                if (toValue(searchable) && isOpen.value) return;
                e.preventDefault();
                if (isOpen.value && navigableIndices.value.length > 0) {
                    setHighlight(navigableIndices.value[navigableIndices.value.length - 1] ?? -1);
                }
                break;

            case 'ArrowRight': {
                if (toValue(searchable) && isOpen.value) return;
                if (!isOpen.value) return;
                const opt = visibleOptions.value[highlightedIndex.value];
                if (opt?.children?.length && opt.value !== undefined) {
                    if (collapsedValues.value.has(opt.value)) {
                        toggleCollapse(opt.value);
                    }
                }
                break;
            }

            case 'ArrowLeft': {
                if (toValue(searchable) && isOpen.value) return;
                if (!isOpen.value) return;
                const opt = visibleOptions.value[highlightedIndex.value];
                if (opt?.depth && opt.depth > 0 && opt.parentValue !== undefined) {
                    const parentIdx = visibleOptions.value.findIndex(o => o.value === opt.parentValue);
                    if (parentIdx > -1) setHighlight(parentIdx);
                } else if (opt?.children?.length && opt.value !== undefined) {
                    if (!collapsedValues.value.has(opt.value)) {
                        toggleCollapse(opt.value);
                    }
                }
                break;
            }

            case 'Escape':
                if (isOpen.value) {
                    e.preventDefault();
                    e.stopPropagation();
                    close();
                }
                break;

            case 'Tab':
                if (isOpen.value) close();
                break;
        }
    }

    return { onKeyDown };
}
