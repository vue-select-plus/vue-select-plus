import { toValue, type Ref, type MaybeRefOrGetter } from 'vue';
import type { FlatOption } from '../types';

interface UseKeyboardProps {
    isOpen: Ref<boolean>;
    highlightedIndex: Ref<number>;
    visibleOptions: Ref<FlatOption[]>;
    navigableIndices: Ref<number[]>;
    creatorParentValue: Ref<string | number | null>;
    searchQuery: Ref<string>; // NEU
    multiple: boolean;        // NEU
    searchable: boolean; // NEU
    disabled: MaybeRefOrGetter<boolean>;

    // Actions
    open: () => void;
    close: () => void;
    selectOption: (option: FlatOption) => void;
    toggleCollapse: (value: string | number) => void;
    cancelCreator: () => void;
    setHighlight: (index: number) => void;
    removeLastSelection: () => void; // NEU
    collapsedValues: Ref<Set<string | number>>;
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
        let nextPos;

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
                // Robust modulo for negative numbers
                nextPos = ((currentPos - step) % indices.length + indices.length) % indices.length;
            } else {
                nextPos = Math.max(currentPos - step, 0);
            }
        }

        // Safety check to ensure we never set -1 if we have indices
        const targetIndex = indices[nextPos];

        if (targetIndex !== undefined) {
            setHighlight(targetIndex);
        } else {
            setHighlight(indices[0] ?? -1);
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (toValue(disabled)) return;

        // Wenn Creator Mode aktiv ist, lassen wir den Input machen (keine Select Navigation)
        if (creatorParentValue.value !== null) {
            // Escape muss trotzdem funktionieren
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancelCreator();
            }
            return;
        }

        switch (e.key) {
            case 'Backspace':
                // Lösche letztes Tag nur, wenn Input leer ist und wir im Multiple Mode sind
                if (multiple && searchQuery.value.length === 0) {
                    removeLastSelection();
                }
                break;

            case ' ': // Space
                if (searchable && isOpen.value) {
                    // Wenn wir suchen, ist Space ein Leerzeichen -> Standardverhalten
                    break;
                }
                // Ansonsten: Auswählen / Öffnen
                e.preventDefault();
                if (isOpen.value && highlightedIndex.value > -1) {
                    const opt = visibleOptions.value[highlightedIndex.value];
                    if (opt && !opt.disabled) selectOption(opt);
                } else if (!isOpen.value) {
                    open();
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (isOpen.value && highlightedIndex.value > -1) {
                    const opt = visibleOptions.value[highlightedIndex.value];
                    if (opt && !opt.disabled) selectOption(opt);
                } else {
                    open();
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                navigate('next');
                break;

            case 'ArrowUp':
                e.preventDefault();
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
                e.preventDefault();
                if (isOpen.value && navigableIndices.value.length > 0) {
                    setHighlight(navigableIndices.value[0] ?? -1);
                }
                break;

            case 'End':
                e.preventDefault();
                if (isOpen.value && navigableIndices.value.length > 0) {
                    setHighlight(navigableIndices.value[navigableIndices.value.length - 1] ?? -1);
                }
                break;

            case 'ArrowRight': {
                // Wenn wir suchen, Cursor im Input lassen (außer mit Modifier?)
                if (searchable && isOpen.value) return;

                if (!isOpen.value) return;
                const opt = visibleOptions.value[highlightedIndex.value];
                if (opt?.children?.length) {
                    if (collapsedValues.value.has(opt.value!)) {
                        toggleCollapse(opt.value!);
                    }
                }
                break;
            }

            case 'ArrowLeft': {
                // Wenn wir suchen, Cursor im Input lassen
                if (searchable && isOpen.value) return;

                if (!isOpen.value) return;
                const opt = visibleOptions.value[highlightedIndex.value];
                if (opt?.depth && opt.depth > 0 && opt.parentValue) {
                    const parentIdx = visibleOptions.value.findIndex(o => o.value === opt.parentValue);
                    if (parentIdx > -1) setHighlight(parentIdx);
                } else if (opt?.children?.length) {
                    if (!collapsedValues.value.has(opt.value!)) {
                        toggleCollapse(opt.value!);
                    }
                }
                break;
            }

            case 'Escape':
                e.preventDefault();
                close();
                break;

            case 'Tab':
                // Tab schließt das Dropdown
                if (isOpen.value) close();
                break;
        }
    }

    return { onKeyDown };
}