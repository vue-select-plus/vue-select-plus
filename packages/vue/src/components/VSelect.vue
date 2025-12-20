<script lang="ts" setup>
import { useTemplateRef, watch, nextTick, computed, toRef, ref } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useSelect, useClickOutside, type SelectOption, type SelectModelValue } from '@vue-select-plus/core';
import VSelectOption from './VSelectOption.vue';

interface VSelectProps {
    options: ReadonlyArray<SelectOption>;
    label?: string;
    placeholder?: string;
    multiple?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    id?: string;
    error?: string;
    itemHeight?: number;
}

const props = withDefaults(defineProps<VSelectProps>(), {
    placeholder: 'Select...',
    multiple: false,
    searchable: false,
    disabled: false,
    id: () => `v-select-${Math.random().toString(36).slice(2)}`,
    itemHeight: 40
});

const model = defineModel<SelectModelValue>({ required: false });

const emit = defineEmits<{
    (e: 'create', payload: { parent: string | number; value: string }): void;
}>();

const optionsRef = toRef(props, 'options');
const disabledRef = toRef(props, 'disabled');

const {
    isOpen,
    visibleOptions,
    highlightedIndex,
    searchQuery,
    creatorParentValue,
    collapsedValues,
    toggle,
    close,
    onKeyDown,
    handleSelect,
    isSelected,
    toggleCollapse,
    startCreator,
    cancelCreator,
    removeValue,
    removeLast
} = useSelect({
    options: optionsRef,
    modelValue: model,
    multiple: props.multiple,
    searchable: props.searchable,
    disabled: disabledRef
});

// --- Refs ---
const containerRef = useTemplateRef<HTMLElement>('container');
const listRef = useTemplateRef<HTMLElement>('list');
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInput');

// --- Virtualizer ---
const rowVirtualizer = useVirtualizer({
    get count() { return visibleOptions.value.length },
    getScrollElement: () => listRef.value,
    estimateSize: () => props.itemHeight,
    overscan: 5
});

// Function Ref für Creator Input (Stable)
const activeCreatorInput = ref<HTMLInputElement | null>(null);
const setCreatorInput = (el: any) => { if (el) activeCreatorInput.value = el; };

useClickOutside(containerRef, () => close());

// Search Focus Logic
watch(isOpen, async (val) => {
    if (val && props.searchable) {
        await nextTick();
        searchInputRef.value?.focus();
    }
});

// Auto-Scroll (Virtual Aware)
watch(highlightedIndex, async (idx) => {
    if (!isOpen.value || idx === -1) return;
    rowVirtualizer.value.scrollToIndex(idx, { align: 'auto' });
});

// Creator Focus
watch(creatorParentValue, async (val) => {
    if (val !== null) {
        await nextTick();
        activeCreatorInput.value?.focus();
    }
});

function handleCreate(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = target.value.trim();
    if (val && creatorParentValue.value !== null) {
        emit('create', { parent: creatorParentValue.value, value: val });
        target.value = '';
        cancelCreator();
    }
}

// --- Display Helpers ---
function findLabel(opts: ReadonlyArray<SelectOption>, val: string | number): string | undefined {
    for (const opt of opts) {
        if (opt.value === val) return opt.label;
        if (opt.children && opt.children.length > 0) {
            const found = findLabel(opt.children, val);
            if (found) return found;
        }
    }
    return undefined;
}

function getLabel(val: string | number) {
    return findLabel(props.options, val) ?? val;
}

const selectedTags = computed(() => {
    if (!props.multiple || !Array.isArray(model.value)) return [];
    return model.value.map(val => ({
        value: val,
        label: getLabel(val)
    }));
});

const singleLabel = computed(() => {
    if (props.multiple || model.value === undefined || model.value === null) return null;
    return getLabel(model.value as string | number);
});

// Logic: Wann zeigen wir was?
const showSearch = computed(() => props.searchable && isOpen.value);
const showTags = computed(() => props.multiple && selectedTags.value.length > 0);
const showSingleValue = computed(() => !props.multiple && singleLabel.value && !showSearch.value);
// Placeholder nur zeigen, wenn nichts ausgewählt ist UND wir nicht suchen (oder im Multiple Mode suchen)
const showPlaceholder = computed(() => {
    if (showSingleValue.value) return false;
    if (showTags.value) return false;
    if (showSearch.value && !props.multiple) return false; // Im Single Mode ersetzt Search den Placeholder
    return true;
});

const searchPlaceholder = computed(() => {
    if (props.multiple) return '';
    return singleLabel.value ? String(singleLabel.value) : props.placeholder;
});
</script>

<template>
    <div ref="container" :id="id" class="vue-select-root" :class="{
        'is-open': isOpen,
        'is-disabled': disabled,
        'has-error': !!error
    }" @keydown="onKeyDown">
        <label v-if="label" class="vue-select-label" @click="toggle">
            {{ label }}
        </label>

        <div class="vue-select-trigger" tabindex="0" role="combobox"
            :aria-expanded="isOpen"
            :aria-controls="`${id}-menu`"
            :aria-activedescendant="highlightedIndex > -1 ? `${id}-option-${highlightedIndex}` : undefined"
            @click="toggle">
            <div class="vue-select-content-wrapper">

                <!-- 1. Tags (Multiple) -->
                <span v-if="showTags" v-for="tag in selectedTags" :key="tag.value" class="vue-select-tag" @click.stop>
                    {{ tag.label }}
                    <button type="button" class="vue-select-tag-remove" @click.stop="removeValue(tag.value)"
                        tabindex="-1">
                        &times;
                    </button>
                </span>

                <!-- 2. Single Value (Visible if closed or not searchable) -->
                <span v-if="showSingleValue" class="vue-select-single-value">
                    <slot name="value" :value="model" :label="singleLabel">
                        {{ singleLabel }}
                    </slot>
                </span>

                <!-- 3. Placeholder (Visible if empty) -->
                <span v-if="showPlaceholder" class="vue-select-placeholder">
                    {{ placeholder }}
                </span>

                <!-- 4. Unified Search Input (Always last in flex flow) -->
                <input v-if="showSearch" ref="searchInput" v-model="searchQuery" class="vue-select-input"
                    :class="{ 'vue-select-input--multiple': multiple }" :placeholder="searchPlaceholder" @click.stop
                    autofocus />
            </div>

            <div class="vue-select-icons">
                <slot name="trigger-icon" :is-open="isOpen">
                    <span class="vue-select-arrow" :class="{ 'vue-select-arrow--open': isOpen }">▼</span>
                </slot>
            </div>
        </div>

        <span v-if="error" class="vue-select-error-msg">{{ error }}</span>

        <!-- Dropdown (Virtual) -->
        <!-- Dropdown (Virtual) -->
        <!-- Dropdown (Virtual) -->
        <div v-if="isOpen" ref="list" :id="`${id}-menu`" role="listbox" class="vue-select-menu" @mousedown.prevent>
            
            <div v-if="visibleOptions.length === 0" class="vue-select-empty">
                <slot name="empty">No results.</slot>
            </div>

            <div :style="{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
            }">
                <template v-for="virtualRow in rowVirtualizer.getVirtualItems()" :key="virtualRow.key">
                    <component :is="'div'" 
                        :style="{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }"
                    >
                        <!-- We use a renderless component trick or just direct access if guarded -->
                        <template v-if="visibleOptions[virtualRow.index]">
                           <!-- Group -->
                           <div v-if="visibleOptions[virtualRow.index]!.isGroup" class="vue-select-group">
                                <slot name="group" :group="visibleOptions[virtualRow.index]!">{{ visibleOptions[virtualRow.index]!.group }}</slot>
                           </div>

                           <!-- Creator -->
                           <div v-else-if="visibleOptions[virtualRow.index]!.isCreator" class="vue-select-creator"
                                :style="{ paddingLeft: `${(visibleOptions[virtualRow.index]!.depth * 1.25) + 0.5}rem` }" @click.stop>
                                <slot name="creator" :cancel="cancelCreator">
                                    <div class="vue-select-creator-inner">
                                        <input :ref="setCreatorInput" class="vue-select-creator-input" placeholder="New item..."
                                            @keydown.enter.stop="handleCreate" @keydown.escape.stop="cancelCreator"
                                            @blur="cancelCreator" />
                                    </div>
                                </slot>
                            </div>

                            <!-- Option -->
                            <VSelectOption v-else 
                                :id="`${id}-option-${virtualRow.index}`"
                                :option="visibleOptions[virtualRow.index]!" 
                                :active="virtualRow.index === highlightedIndex" 
                                :selected="isSelected(visibleOptions[virtualRow.index]!.value)"
                                :collapsed="collapsedValues.has(visibleOptions[virtualRow.index]!.value!)" 
                                @click="handleSelect" 
                                @toggle="toggleCollapse"
                                @add-child="startCreator">
                                <template #label="{ option }">
                                    <slot name="option" :option="option">{{ option.label }}</slot>
                                </template>
                                <template #toggle-icon="{ collapsed }">
                                    <slot name="toggle-icon" :collapsed="collapsed" :option="visibleOptions[virtualRow.index]!" />
                                </template>
                                <template #add-icon>
                                    <slot name="add-icon" :option="visibleOptions[virtualRow.index]!" />
                                </template>
                            </VSelectOption>
                        </template>
                    </component>
                </template>
            </div>
        </div>
    </div>
</template>