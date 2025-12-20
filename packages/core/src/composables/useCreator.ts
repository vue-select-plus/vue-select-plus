import { ref } from 'vue';

/**
 * Manages the state for the inline creator (Add Child) mode.
 */
export function useCreator() {
    const creatorParentValue = ref<string | number | null>(null);

    function startCreator(parentValue: string | number) {
        creatorParentValue.value = parentValue;
    }

    function cancelCreator() {
        creatorParentValue.value = null;
    }

    return {
        creatorParentValue,
        startCreator,
        cancelCreator
    };
}