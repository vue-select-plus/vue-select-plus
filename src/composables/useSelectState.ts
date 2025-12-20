import { ref, type Ref, type MaybeRefOrGetter, toValue } from 'vue';

/**
 * Manages the basic UI state of the select component.
 */
export function useSelectState(disabled: MaybeRefOrGetter<boolean>) {
    const isOpen = ref(false);
    const searchQuery = ref('');
    const highlightedIndex = ref(-1);

    function open() {
        if (toValue(disabled)) return;
        isOpen.value = true;
    }

    function close() {
        isOpen.value = false;
        searchQuery.value = '';
        highlightedIndex.value = -1;
    }

    function toggle() {
        isOpen.value ? close() : open();
    }

    function setHighlight(index: number) {
        highlightedIndex.value = index;
    }

    return {
        isOpen,
        searchQuery,
        highlightedIndex,
        open,
        close,
        toggle,
        setHighlight
    };
}