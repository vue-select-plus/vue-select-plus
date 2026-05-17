import { ref } from 'vue';

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