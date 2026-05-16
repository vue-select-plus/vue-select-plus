<script lang="ts" setup>
import { computed } from 'vue';
import type { FlatOption, SelectValue } from '@vue-select-plus/core';

interface Props {
    option: FlatOption;
    active: boolean;
    selected: boolean;
    collapsed: boolean;
    id: string;
    setSize?: number;
    posInSet?: number;
    removeLabel?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'click', option: FlatOption): void;
    (e: 'toggle', value: SelectValue): void;
    (e: 'add-child', value: SelectValue): void;
}>();

const indentStyle = computed(() => ({
    paddingInlineStart: `${(props.option.depth * 1.25) + 0.5}rem`
}));

const hasChildren = computed(() => !!props.option.children?.length);
const optionValue = computed(() => props.option.value);

function onToggleClick(e: MouseEvent) {
    e.stopPropagation();
    if (optionValue.value !== undefined) emit('toggle', optionValue.value);
}

function onAddChildClick(e: MouseEvent) {
    e.stopPropagation();
    if (optionValue.value !== undefined) emit('add-child', optionValue.value);
}

function onOptionClick() {
    if (props.option.disabled) return;
    emit('click', props.option);
}
</script>

<template>
    <div
        :id="id"
        role="option"
        :aria-selected="selected"
        :aria-disabled="option.disabled || undefined"
        :aria-expanded="hasChildren ? !collapsed : undefined"
        :aria-level="option.depth + 1"
        :aria-setsize="setSize"
        :aria-posinset="posInSet"
        class="vue-select-option"
        :class="{
            'vue-select-option--active': active,
            'vue-select-option--selected': selected,
            'vue-select-option--disabled': option.disabled
        }"
        :style="indentStyle"
        @click="onOptionClick"
    >
        <button
            v-if="hasChildren"
            type="button"
            class="vue-select-toggle"
            :aria-label="collapsed ? `Expand ${option.label}` : `Collapse ${option.label}`"
            :aria-controls="`${id}-children`"
            :aria-expanded="!collapsed"
            tabindex="-1"
            @click="onToggleClick"
            @mousedown.stop.prevent
        >
            <slot name="toggle-icon" :collapsed="collapsed">
                <svg class="vue-select-chevron" :class="{ 'vue-select-chevron--collapsed': collapsed }"
                    width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false">
                    <path d="M1 1 L5 5 L9 1" stroke="currentColor" stroke-width="1.5" fill="none" />
                </svg>
            </slot>
        </button>

        <span v-else class="vue-select-spacer" aria-hidden="true"></span>

        <div class="vue-select-label-container">
            <slot name="label" :option="option">
                {{ option.label }}
            </slot>
        </div>

        <div v-if="!option.disabled && hasChildren" class="vue-select-actions">
            <button
                type="button"
                class="vue-select-action-btn"
                :aria-label="removeLabel ?? `Add child to ${option.label}`"
                tabindex="-1"
                @click="onAddChildClick"
                @mousedown.stop.prevent
            >
                <slot name="add-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                        <path d="M6 2 V10 M2 6 H10" stroke="currentColor" stroke-width="1.5" fill="none" />
                    </svg>
                </slot>
            </button>
        </div>
    </div>
</template>
