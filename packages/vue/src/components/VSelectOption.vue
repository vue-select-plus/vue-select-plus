<script lang="ts" setup>
import { computed } from 'vue';
import type { FlatOption, SelectValue } from '@vue-select-plus/core';

/**
 * Internal renderer used by `<VSelect>` for every row in the virtualized
 * listbox. Not part of the public component API — consumers customize via
 * the `option`, `toggle-icon`, `add-icon` slots on `<VSelect>` instead.
 */
interface Props {
    /** The flattened option to render (already enriched with depth/grouping). */
    option: FlatOption;
    /** `true` when this row is the current `aria-activedescendant` target. */
    active: boolean;
    /** `true` when this row's value is part of the model. */
    selected: boolean;
    /** `true` when this option's children are currently hidden in the tree. */
    collapsed: boolean;
    /** DOM id referenced by the combobox's `aria-activedescendant`. */
    id: string;
    /**
     * Total number of *navigable* siblings (groups, disabled rows, and the
     * creator placeholder are excluded). Exposed via `aria-setsize`.
     */
    setSize?: number;
    /** 1-based position inside the navigable set. Exposed via `aria-posinset`. */
    posInSet?: number;
    /** Accessible label for the "+" add-child button. */
    removeLabel?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    /** Fired when the user clicks the row body. The host calls `handleSelect`. */
    (e: 'click', option: FlatOption): void;
    /** Fired when the user clicks the tree-expand chevron. Payload is the row's value. */
    (e: 'toggle', value: SelectValue): void;
    /** Fired when the user clicks the "+" add-child button. Payload is the parent's value. */
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
