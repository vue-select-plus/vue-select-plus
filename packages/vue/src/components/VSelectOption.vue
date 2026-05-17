<script lang="ts" setup>
import { computed } from 'vue';
import type { FlatOption, SelectValue } from '@vue-select-plus/core';

// Internal row renderer. Public customisation goes through the `option`,
// `toggle-icon`, and `add-icon` slots on <VSelect>.
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
    creatable?: boolean;
    expandLabel?: (label: string) => string;
    collapseLabel?: (label: string) => string;
    addChildLabel?: (label: string) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    click: [option: FlatOption];
    toggle: [value: SelectValue];
    'add-child': [value: SelectValue];
}>();

const indentStyle = computed(() => ({
    paddingInlineStart: `calc(${props.option.depth} * var(--vs-tree-indent-step) + var(--vs-tree-indent-base))`
}));

const hasChildren = computed(() => !!props.option.children?.length);
const optionValue = computed(() => props.option.value);

// aria-level is only meaningful in a tree; omitting it on flat listboxes
// keeps axe quiet.
const ariaLevel = computed<number | undefined>(() =>
    (props.option.depth > 0 || hasChildren.value) ? props.option.depth + 1 : undefined
);

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
        :aria-level="ariaLevel"
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
            :aria-label="
                collapsed
                    ? (expandLabel ? expandLabel(option.label) : `Expand ${option.label}`)
                    : (collapseLabel ? collapseLabel(option.label) : `Collapse ${option.label}`)
            "
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

        <!-- Reserves the chevron slot on leaf rows so labels stay aligned. -->
        <span v-else class="vue-select-spacer" aria-hidden="true"></span>

        <div class="vue-select-label-container">
            <slot name="label" :option="option">
                {{ option.label }}
            </slot>
        </div>

        <div v-if="creatable && !option.disabled && hasChildren" class="vue-select-actions">
            <button
                type="button"
                class="vue-select-action-btn"
                :aria-label="addChildLabel ? addChildLabel(option.label) : `Add child to ${option.label}`"
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
