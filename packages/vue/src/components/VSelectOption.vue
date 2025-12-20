<script lang="ts" setup>
import { computed } from 'vue';
import type { FlatOption } from '@vue-select-plus/core';

interface Props {
    option: FlatOption;
    active: boolean;
    selected: boolean;
    collapsed: boolean;
    id: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'click', option: FlatOption): void;
    (e: 'toggle', value: string | number): void;
    (e: 'add-child', value: string | number): void;
}>();

const indentStyle = computed(() => ({
    paddingLeft: `${(props.option.depth * 1.25) + 0.5}rem`
}));

const hasChildren = computed(() => !!props.option.children?.length);
</script>

<template>
    <div role="option" :id="id" :aria-selected="selected" :aria-disabled="option.disabled" class="vue-select-option" :class="{
        'vue-select-option--active': active,
        'vue-select-option--selected': selected,
        'vue-select-option--disabled': option.disabled
    }" :style="indentStyle" @click="!option.disabled && emit('click', option)">
        <span v-if="hasChildren" class="vue-select-toggle" @click.stop="emit('toggle', option.value!)">
            <slot name="toggle-icon" :collapsed="collapsed">
                <span class="vue-select-chevron" :class="{ 'vue-select-chevron--collapsed': collapsed }">
                    ▼
                </span>
            </slot>
        </span>

        <span v-else class="vue-select-spacer"></span>

        <div class="vue-select-label-container">
            <slot name="label" :option="option">
                {{ option.label }}
            </slot>
        </div>

        <div v-if="!option.disabled" class="vue-select-actions">
            <button v-if="hasChildren" class="vue-select-action-btn" @click.stop="emit('add-child', option.value!)"
                tabindex="-1" type="button" title="Add child">
                <slot name="add-icon">
                    +
                </slot>
            </button>
        </div>
    </div>
</template>