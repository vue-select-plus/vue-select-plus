<script lang="ts" setup>
import {
    useTemplateRef,
    watch,
    nextTick,
    computed,
    toRef,
    ref,
    useId,
    onBeforeUnmount,
    onMounted
} from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    size as sizeMiddleware,
    type Placement
} from '@floating-ui/vue';
import {
    useSelect,
    useClickOutside,
    type SelectOption,
    type SelectModelValue,
    type SelectValue
} from '@vue-select-plus/core';
import VSelectOption from './VSelectOption.vue';

interface VSelectLabels {
    clear?: string;
    removeItem?: (label: string) => string;
    noResults?: string;
    addChild?: string;
    resultsCount?: (count: number) => string;
    loading?: string;
    typeToSearch?: (min: number) => string;
}

interface VSelectProps {
    options: ReadonlyArray<SelectOption>;
    label?: string;
    placeholder?: string;
    multiple?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    required?: boolean;
    clearable?: boolean;
    name?: string;
    id?: string;
    error?: string;
    /** Visible row height in px. Used for virtualization. */
    itemHeight?: number;
    /** Accessible label for the listbox. Defaults to the `label` prop. */
    listboxLabel?: string;
    /** Localizable text for screen reader announcements. */
    labels?: VSelectLabels;
    /** Preferred placement of the dropdown. Auto-flips when no space is available. */
    placement?: Placement;
    /**
     * Where to render the dropdown.
     * - `true` (default): teleport to `<body>` to escape `overflow: hidden` ancestors.
     * - `false`: render inline (same DOM position as the trigger).
     * - `string` (CSS selector) or `HTMLElement`: teleport to that target.
     */
    teleport?: boolean | string | HTMLElement;
    /** Maximum visible height of the dropdown in px. */
    maxMenuHeight?: number;
    /** Show a spinner + announce a busy state (typically while async-fetching options). */
    loading?: boolean;
    /**
     * Enable client-side filtering. Set to `false` for server-driven search:
     * the parent listens to `@search` and replaces `options` itself.
     */
    filterable?: boolean;
    /** Minimum query length before `@search` is emitted and the menu attempts to show results. */
    minSearchLength?: number;
    /** Debounce delay (ms) for the `@search` event. `0` disables debouncing. */
    searchDebounce?: number;
    /** Visual size variant. Maps to padding + font-size + control height. */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Forwarded to the underlying input in searchable mode. Use this for browser
     * autofill hints (`autocomplete="country"`, `autocomplete="off"`, …).
     */
    autocomplete?: string;
    /** Forwarded `inputmode` for soft-keyboard hints on mobile. */
    inputmode?: 'none' | 'text' | 'search' | 'numeric' | 'email' | 'tel' | 'url' | 'decimal';
    /**
     * Enable browser-native form validation. When `required` is true and the
     * model is empty, the next `<form>` submit will be blocked and the browser
     * will surface its own validation tooltip.
     */
    validateOnSubmit?: boolean;
    /** Custom message for the browser-native required validation tooltip. */
    validationMessage?: string;
}

const props = withDefaults(defineProps<VSelectProps>(), {
    placeholder: 'Select...',
    multiple: false,
    searchable: false,
    disabled: false,
    required: false,
    clearable: false,
    itemHeight: 40,
    placement: 'bottom-start',
    teleport: true,
    maxMenuHeight: 320,
    loading: false,
    filterable: true,
    minSearchLength: 0,
    searchDebounce: 0,
    size: 'md',
    autocomplete: 'off',
    validateOnSubmit: true
});

const model = defineModel<SelectModelValue>({ required: false });

const emit = defineEmits<{
    (e: 'create', payload: { parent: SelectValue; value: string }): void;
    (e: 'open'): void;
    (e: 'close'): void;
    (e: 'search', query: string): void;
}>();

const optionsRef = toRef(props, 'options');
const disabledRef = toRef(props, 'disabled');
const filterableRef = toRef(props, 'filterable');

const {
    isOpen,
    visibleOptions,
    highlightedIndex,
    searchQuery,
    creatorParentValue,
    collapsedValues,
    labelMap,
    close,
    open,
    onKeyDown,
    handleSelect,
    isSelected,
    toggleCollapse,
    startCreator,
    cancelCreator,
    removeValue,
    clear,
    setHighlight
} = useSelect({
    options: optionsRef,
    modelValue: model,
    multiple: props.multiple,
    searchable: props.searchable,
    disabled: disabledRef,
    filterable: filterableRef
});

// --- IDs (SSR-safe) ---
const autoId = useId();
const rootId = computed(() => props.id ?? `vsp-${autoId}`);
const listboxId = computed(() => `${rootId.value}-listbox`);
const labelId = computed(() => `${rootId.value}-label`);
const errorId = computed(() => `${rootId.value}-error`);
const statusId = computed(() => `${rootId.value}-status`);
const valueId = computed(() => `${rootId.value}-value`);

// --- Refs ---
const containerRef = useTemplateRef<HTMLElement>('container');
const controlRef = useTemplateRef<HTMLElement>('control');
const listRef = useTemplateRef<HTMLElement>('list');
const inputRef = useTemplateRef<HTMLInputElement>('input');
const buttonRef = useTemplateRef<HTMLButtonElement>('button');
const validationRef = useTemplateRef<HTMLInputElement>('validation');

// --- Floating UI ---
const { floatingStyles, placement: actualPlacement } = useFloating(controlRef, listRef, {
    open: isOpen,
    placement: computed(() => props.placement),
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
    middleware: computed(() => [
        offset(4),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        sizeMiddleware({
            padding: 8,
            apply({ rects, elements, availableHeight }) {
                Object.assign(elements.floating.style, {
                    minWidth: `${rects.reference.width}px`,
                    maxHeight: `${Math.min(availableHeight, props.maxMenuHeight)}px`
                });
            }
        })
    ])
});

const teleportTarget = computed(() => {
    if (props.teleport === false) return undefined;
    if (props.teleport === true) return 'body';
    return props.teleport;
});

// --- Virtualizer ---
const rowVirtualizer = useVirtualizer({
    get count() { return visibleOptions.value.length; },
    getScrollElement: () => listRef.value,
    estimateSize: () => props.itemHeight,
    overscan: 5
});

const activeCreatorInput = ref<HTMLInputElement | null>(null);
const setCreatorInput = (el: unknown) => {
    if (el instanceof HTMLInputElement) activeCreatorInput.value = el;
};

// Include `listRef` so clicks inside the teleported menu aren't treated as outside.
useClickOutside([containerRef, listRef], () => {
    if (isOpen.value) close();
});

function focusTrigger() {
    if (props.searchable) {
        inputRef.value?.focus();
    } else {
        buttonRef.value?.focus();
    }
}

watch(isOpen, async (val, prev) => {
    if (val) {
        emit('open');
        await nextTick();
        if (props.searchable) {
            inputRef.value?.focus();
        }
    } else if (prev) {
        emit('close');
        // Return focus to the trigger when the menu closes via keyboard/clickoutside.
        await nextTick();
        if (document.activeElement === document.body) {
            focusTrigger();
        }
    }
});

watch(highlightedIndex, (idx) => {
    if (!isOpen.value || idx === -1) return;
    rowVirtualizer.value.scrollToIndex(idx, { align: 'auto' });
});

watch(creatorParentValue, async (val) => {
    if (val !== null) {
        await nextTick();
        activeCreatorInput.value?.focus();
    }
});

// Debounced `@search` emission. Internal `searchQuery` always updates immediately
// so the input stays responsive — only the outbound event is throttled.
let searchEmitTimer: ReturnType<typeof setTimeout> | null = null;
let lastEmittedQuery: string | null = null;

function emitSearch(query: string) {
    if (query === lastEmittedQuery) return;
    lastEmittedQuery = query;
    emit('search', query);
}

watch(searchQuery, (val) => {
    if (searchEmitTimer) {
        clearTimeout(searchEmitTimer);
        searchEmitTimer = null;
    }
    if (val.length < props.minSearchLength) return;
    if (props.searchDebounce > 0) {
        searchEmitTimer = setTimeout(() => emitSearch(val), props.searchDebounce);
    } else {
        emitSearch(val);
    }
});

watch(visibleOptions, (list) => {
    if (highlightedIndex.value >= list.length) {
        setHighlight(list.length > 0 ? 0 : -1);
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

function getLabel(val: SelectValue): string {
    return labelMap.value.get(val) ?? String(val);
}

const selectedTags = computed(() => {
    if (!props.multiple || !Array.isArray(model.value)) return [];
    return model.value.map(val => ({ value: val, label: getLabel(val) }));
});

const singleLabel = computed(() => {
    if (props.multiple || model.value === undefined || model.value === null) return null;
    if (Array.isArray(model.value)) return null;
    return getLabel(model.value);
});

const hasValue = computed(() => {
    if (Array.isArray(model.value)) return model.value.length > 0;
    return model.value !== undefined && model.value !== null && model.value !== '';
});

const showSearch = computed(() => props.searchable && isOpen.value);
const showTags = computed(() => props.multiple && selectedTags.value.length > 0);
const showSingleValue = computed(() => !props.multiple && singleLabel.value !== null && !showSearch.value);
const showPlaceholder = computed(() => {
    if (showSingleValue.value) return false;
    if (showTags.value) return false;
    if (showSearch.value && !props.multiple) return false;
    return true;
});

const searchPlaceholder = computed(() => {
    if (props.multiple) return '';
    return singleLabel.value !== null ? String(singleLabel.value) : props.placeholder;
});

const activeOptionId = computed(() => {
    if (!isOpen.value || highlightedIndex.value < 0) return undefined;
    const opt = visibleOptions.value[highlightedIndex.value];
    if (!opt || opt.isGroup || opt.isCreator) return undefined;
    return `${rootId.value}-opt-${highlightedIndex.value}`;
});

const listboxAriaLabel = computed(() => props.listboxLabel ?? (props.label ? undefined : props.placeholder));

/**
 * Screen-reader announcement of the current selection. For non-searchable mode
 * this becomes part of the combobox's accessible name (via aria-labelledby).
 * For searchable mode it's referenced via aria-describedby only when the
 * search input is empty — otherwise the typed query is what the user cares about.
 */
const valueAnnouncement = computed(() => {
    if (props.multiple) {
        const n = selectedTags.value.length;
        if (n === 0) return props.placeholder;
        if (n === 1) return `${selectedTags.value[0]!.label}, 1 item selected`;
        const labels = selectedTags.value.map(t => t.label).join(', ');
        return `${labels}, ${n} items selected`;
    }
    return singleLabel.value !== null ? String(singleLabel.value) : props.placeholder;
});

// Non-searchable: include both the external <label> and the value summary.
// Searchable: only the external label — the input value itself carries the search query.
const triggerLabelledBy = computed(() => {
    if (props.searchable) {
        return props.label ? labelId.value : undefined;
    }
    const parts: string[] = [];
    if (props.label) parts.push(labelId.value);
    parts.push(valueId.value);
    return parts.join(' ');
});

const triggerDescribedBy = computed(() => {
    const parts: string[] = [];
    if (props.error) parts.push(errorId.value);
    if (isOpen.value) parts.push(statusId.value);
    // For searchable, announce the current selection only when the input is empty.
    if (props.searchable && searchQuery.value.length === 0 && hasValue.value) {
        parts.push(valueId.value);
    }
    return parts.length ? parts.join(' ') : undefined;
});

const resolvedLabels = computed(() => ({
    clear: props.labels?.clear ?? 'Clear selection',
    removeItem: props.labels?.removeItem ?? ((label: string) => `Remove ${label}`),
    noResults: props.labels?.noResults ?? 'No results.',
    addChild: props.labels?.addChild ?? 'Add child item',
    resultsCount: props.labels?.resultsCount ?? ((count: number) =>
        count === 0 ? 'No results available.' : `${count} result${count === 1 ? '' : 's'} available.`),
    loading: props.labels?.loading ?? 'Loading…',
    typeToSearch: props.labels?.typeToSearch ?? ((min: number) =>
        `Type at least ${min} character${min === 1 ? '' : 's'} to search.`)
}));

const navigableCount = computed(() =>
    visibleOptions.value.filter(o => !o.isGroup && !o.isCreator && !o.disabled).length
);

const belowMinSearch = computed(() =>
    props.searchable && props.minSearchLength > 0 && searchQuery.value.length < props.minSearchLength
);

const statusMessage = computed(() => {
    if (!isOpen.value) return '';
    if (props.loading) return resolvedLabels.value.loading;
    if (belowMinSearch.value) return resolvedLabels.value.typeToSearch(props.minSearchLength);
    return resolvedLabels.value.resultsCount(navigableCount.value);
});

const formValues = computed<string[]>(() => {
    const v = model.value;
    if (v === undefined || v === null) return [];
    if (Array.isArray(v)) return v.map(String);
    return [String(v)];
});

function onTriggerClick() {
    if (props.disabled) return;
    if (isOpen.value) close();
    else open();
}

function onInputClick(e: MouseEvent) {
    // Stop the click from bubbling to `.vue-select-control` where `onTriggerClick`
    // would toggle the menu back closed.
    e.stopPropagation();
    if (!isOpen.value && !props.disabled) open();
}

function onClearClick(e: Event) {
    e.stopPropagation();
    if (props.disabled) return;
    clear();
    focusTrigger();
}

function onRemoveTag(value: SelectValue, e: Event) {
    e.stopPropagation();
    if (props.disabled) return;
    removeValue(value);
    focusTrigger();
}

// HTML5 form validation: when `required` + `validateOnSubmit` are on and the
// model is empty, set a custom validity message so form submission is blocked
// by the browser. The validation surface is a 1×1 invisible focusable input.
const isModelEmpty = computed(() =>
    Array.isArray(model.value)
        ? model.value.length === 0
        : model.value === undefined || model.value === null || model.value === ''
);

function syncValidity() {
    const el = validationRef.value;
    if (!el) return;
    const needsValidation = props.validateOnSubmit && props.required && isModelEmpty.value && !props.disabled;
    el.setCustomValidity(
        needsValidation ? (props.validationMessage ?? 'Please select an item.') : ''
    );
}

onMounted(syncValidity);
watch([isModelEmpty, () => props.required, () => props.validateOnSubmit, () => props.disabled], () => {
    nextTick(syncValidity);
});

// Bridge focus from the hidden validation input back to the real combobox so the
// native validation tooltip points at something the user can actually see.
function onValidationFocus() {
    focusTrigger();
}

onBeforeUnmount(() => {
    if (searchEmitTimer) clearTimeout(searchEmitTimer);
    if (isOpen.value) close();
});

defineExpose({
    open,
    close,
    focus: focusTrigger,
    clear
});
</script>

<template>
    <div
        ref="container"
        :id="rootId"
        class="vue-select-root"
        :class="[
            `vue-select-root--${size}`,
            {
                'is-open': isOpen,
                'is-disabled': disabled,
                'is-multiple': multiple,
                'is-searchable': searchable,
                'is-loading': loading,
                'has-error': !!error,
                'has-value': hasValue
            }
        ]"
        @keydown="onKeyDown"
    >
        <label
            v-if="label"
            :id="labelId"
            :for="searchable ? `${rootId}-input` : `${rootId}-button`"
            class="vue-select-label"
        >
            {{ label }}
            <span v-if="required" class="vue-select-required" aria-hidden="true">*</span>
        </label>

        <div ref="control" class="vue-select-control" @mousedown.prevent="focusTrigger" @click="onTriggerClick">
            <div class="vue-select-content">
                <!-- Tags (multiple) -->
                <span
                    v-for="tag in selectedTags"
                    :key="tag.value"
                    class="vue-select-tag"
                >
                    <span class="vue-select-tag-label">{{ tag.label }}</span>
                    <button
                        v-if="!disabled"
                        type="button"
                        class="vue-select-tag-remove"
                        :aria-label="resolvedLabels.removeItem(tag.label)"
                        @click="onRemoveTag(tag.value, $event)"
                        @mousedown.stop.prevent
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                            <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" stroke-width="1.5" fill="none" />
                        </svg>
                    </button>
                </span>

                <!-- Single value display (non-searchable or closed) -->
                <span v-if="showSingleValue" class="vue-select-single-value">
                    <slot name="value" :value="model" :label="singleLabel">
                        {{ singleLabel }}
                    </slot>
                </span>

                <!-- Placeholder -->
                <span v-if="showPlaceholder" class="vue-select-placeholder">
                    {{ placeholder }}
                </span>

                <!-- Searchable: input is the combobox -->
                <input
                    v-if="searchable"
                    ref="input"
                    :id="`${rootId}-input`"
                    v-model="searchQuery"
                    class="vue-select-input"
                    type="text"
                    role="combobox"
                    :autocomplete="autocomplete"
                    :inputmode="inputmode"
                    autocorrect="off"
                    autocapitalize="none"
                    spellcheck="false"
                    :placeholder="searchPlaceholder"
                    :aria-expanded="isOpen"
                    :aria-controls="listboxId"
                    :aria-activedescendant="activeOptionId"
                    :aria-haspopup="'listbox'"
                    :aria-autocomplete="'list'"
                    :aria-labelledby="triggerLabelledBy"
                    :aria-describedby="triggerDescribedBy"
                    :aria-invalid="!!error || undefined"
                    :aria-required="required || undefined"
                    :aria-busy="loading || undefined"
                    :disabled="disabled"
                    @click="onInputClick"
                />

                <!-- Non-searchable: button is the combobox -->
                <button
                    v-else
                    ref="button"
                    :id="`${rootId}-button`"
                    type="button"
                    class="vue-select-button"
                    role="combobox"
                    :aria-expanded="isOpen"
                    :aria-controls="listboxId"
                    :aria-activedescendant="activeOptionId"
                    :aria-haspopup="'listbox'"
                    :aria-labelledby="triggerLabelledBy"
                    :aria-describedby="triggerDescribedBy"
                    :aria-invalid="!!error || undefined"
                    :aria-required="required || undefined"
                    :aria-busy="loading || undefined"
                    :disabled="disabled"
                ></button>

                <!--
                  Screen-reader-only summary of the current selection. Referenced by
                  the combobox via aria-labelledby (non-searchable) or aria-describedby
                  (searchable, when the input is empty).
                -->
                <span :id="valueId" class="vue-select-sr-only">{{ valueAnnouncement }}</span>
            </div>

            <div class="vue-select-indicators">
                <span v-if="loading" class="vue-select-spinner" aria-hidden="true">
                    <slot name="loading-icon">
                        <svg width="14" height="14" viewBox="0 0 50 50" focusable="false">
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="5"
                                stroke-linecap="round"
                                stroke-dasharray="80 50"
                            />
                        </svg>
                    </slot>
                </span>
                <button
                    v-if="clearable && hasValue && !disabled"
                    type="button"
                    class="vue-select-clear"
                    :aria-label="resolvedLabels.clear"
                    tabindex="-1"
                    @click="onClearClick"
                    @mousedown.stop.prevent
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                        <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" stroke-width="1.5" fill="none" />
                    </svg>
                </button>
                <span class="vue-select-arrow" :class="{ 'vue-select-arrow--open': isOpen }" aria-hidden="true">
                    <slot name="trigger-icon" :is-open="isOpen">
                        <svg width="10" height="6" viewBox="0 0 10 6" focusable="false">
                            <path d="M1 1 L5 5 L9 1" stroke="currentColor" stroke-width="1.5" fill="none" />
                        </svg>
                    </slot>
                </span>
            </div>
        </div>

        <p v-if="error" :id="errorId" class="vue-select-error-msg" aria-live="polite">
            {{ error }}
        </p>

        <!-- Screen-reader-only live region for result counts -->
        <span :id="statusId" class="vue-select-sr-only" aria-live="polite" role="status">
            {{ statusMessage }}
        </span>

        <!-- Native form integration: hidden inputs serialize like a native <select>. -->
        <template v-if="name">
            <input
                v-if="formValues.length === 0"
                type="hidden"
                :name="name"
                value=""
            />
            <input
                v-for="(val, idx) in formValues"
                :key="`form-${idx}-${val}`"
                type="hidden"
                :name="name"
                :value="val"
            />
        </template>

        <!--
          Invisible-but-focusable input that participates in HTML5 form validation.
          When `required` is set and the model is empty, this input carries a
          custom validity message so `<form>` submission is blocked and the
          browser's native validation tooltip appears at the trigger position.
        -->
        <input
            v-if="validateOnSubmit && required"
            ref="validation"
            class="vue-select-validation"
            type="text"
            tabindex="-1"
            aria-hidden="true"
            autocomplete="off"
            @focus="onValidationFocus"
        />

        <!-- Dropdown (virtualized listbox, positioned by Floating UI, optionally teleported) -->
        <Teleport :to="teleportTarget" :disabled="!teleportTarget">
        <Transition name="vue-select-menu" appear>
        <div
            v-if="isOpen"
            ref="list"
            :id="listboxId"
            role="listbox"
            class="vue-select-menu"
            :class="[`vue-select-menu--${actualPlacement}`, `vue-select-menu--${size}`]"
            :style="floatingStyles"
            :data-placement="actualPlacement"
            :aria-label="listboxAriaLabel"
            :aria-labelledby="label ? labelId : undefined"
            :aria-multiselectable="multiple || undefined"
            :aria-busy="loading || undefined"
            @mousedown.prevent
        >
            <div v-if="loading" class="vue-select-state vue-select-state--loading">
                <slot name="loading">
                    <span class="vue-select-spinner vue-select-spinner--menu" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 50 50" focusable="false">
                            <circle
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="5"
                                stroke-linecap="round"
                                stroke-dasharray="80 50"
                            />
                        </svg>
                    </span>
                    <span>{{ resolvedLabels.loading }}</span>
                </slot>
            </div>

            <div v-else-if="belowMinSearch" class="vue-select-state">
                <slot name="hint" :min="minSearchLength">
                    {{ resolvedLabels.typeToSearch(minSearchLength) }}
                </slot>
            </div>

            <div v-else-if="visibleOptions.length === 0" class="vue-select-empty">
                <slot name="empty">{{ resolvedLabels.noResults }}</slot>
            </div>

            <div
                v-else
                :style="{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }"
            >
                <div
                    v-for="virtualRow in rowVirtualizer.getVirtualItems()"
                    :key="String(visibleOptions[virtualRow.index]?.key ?? virtualRow.key)"
                    :style="{
                        position: 'absolute',
                        top: 0,
                        insetInlineStart: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                    }"
                >
                    <template v-if="visibleOptions[virtualRow.index]">
                        <div
                            v-if="visibleOptions[virtualRow.index]!.isGroup"
                            class="vue-select-group"
                            role="presentation"
                        >
                            <slot name="group" :group="visibleOptions[virtualRow.index]!">
                                {{ visibleOptions[virtualRow.index]!.group }}
                            </slot>
                        </div>

                        <div
                            v-else-if="visibleOptions[virtualRow.index]!.isCreator"
                            class="vue-select-creator"
                            :style="{ paddingInlineStart: `${(visibleOptions[virtualRow.index]!.depth * 1.25) + 0.5}rem` }"
                            @click.stop
                        >
                            <slot name="creator" :cancel="cancelCreator">
                                <input
                                    :ref="setCreatorInput"
                                    class="vue-select-creator-input"
                                    placeholder="New item..."
                                    :aria-label="resolvedLabels.addChild"
                                    @keydown.enter.stop="handleCreate"
                                    @keydown.escape.stop="cancelCreator"
                                    @blur="cancelCreator"
                                />
                            </slot>
                        </div>

                        <VSelectOption
                            v-else
                            :id="`${rootId}-opt-${virtualRow.index}`"
                            :option="visibleOptions[virtualRow.index]!"
                            :active="virtualRow.index === highlightedIndex"
                            :selected="isSelected(visibleOptions[virtualRow.index]!.value)"
                            :collapsed="visibleOptions[virtualRow.index]!.value !== undefined && collapsedValues.has(visibleOptions[virtualRow.index]!.value!)"
                            :set-size="navigableCount"
                            :pos-in-set="virtualRow.index + 1"
                            :remove-label="resolvedLabels.addChild"
                            @click="handleSelect"
                            @toggle="toggleCollapse"
                            @add-child="startCreator"
                        >
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
                </div>
            </div>
        </div>
        </Transition>
        </Teleport>
    </div>
</template>
