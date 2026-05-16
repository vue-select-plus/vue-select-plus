<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { VSelect } from '@vue-select-plus/vue';
import type { SelectOption } from '@vue-select-plus/core';

// --- Theme ---
//
// Vue Select Plus is class-based: `.dark` (or `.vsp-dark`) on <html> activates
// the dark theme; absence of either keeps it light. For the playground's
// "system" mode we resolve `prefers-color-scheme` ourselves and reactively
// apply/remove the class — that's the recommended pattern for consumers who
// want OS-driven theming.
type Theme = 'system' | 'light' | 'dark';
const theme = ref<Theme>('system');

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const isSystemDark = ref(systemDark.matches);
systemDark.addEventListener('change', (e) => { isSystemDark.value = e.matches; });

const effectiveDark = computed(() => {
    if (theme.value === 'dark') return true;
    if (theme.value === 'light') return false;
    return isSystemDark.value;
});

function applyTheme() {
    document.documentElement.classList.toggle('dark', effectiveDark.value);
}

watch(effectiveDark, applyTheme);
onMounted(applyTheme);

// --- Sample data ---
const fruits: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' }
];

const techStack: SelectOption[] = [
    {
        label: 'Frontend',
        value: 'fe',
        children: [
            { label: 'Vue', value: 'vue' },
            { label: 'React', value: 'react' },
            { label: 'Svelte', value: 'svelte' },
            { label: 'Angular', value: 'angular', disabled: true }
        ]
    },
    {
        label: 'Backend',
        value: 'be',
        children: [
            {
                label: 'Node.js',
                value: 'node',
                children: [
                    { label: 'Express', value: 'express' },
                    { label: 'Fastify', value: 'fastify' },
                    { label: 'NestJS', value: 'nest' }
                ]
            },
            { label: 'Go', value: 'go' },
            { label: 'Rust', value: 'rust' }
        ]
    }
];

const longList: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
    value: `item-${i}`,
    label: `Item ${String(i + 1).padStart(4, '0')}`
}));

// --- State per demo ---
const singleValue = ref<string | null>(null);
const multiValue = ref<string[]>(['apple']);
const searchableValue = ref<string | null>(null);
const treeValue = ref<string[]>(['vue']);
const longValue = ref<string | null>(null);
const errorValue = ref<string | null>(null);
const clearableValue = ref<string | null>('cherry');

// --- Creator demo ---
const creatorOptions = reactive<SelectOption[]>(JSON.parse(JSON.stringify(techStack)));
const creatorValue = ref<string | null>(null);
function handleCreate({ parent, value }: { parent: string | number; value: string }) {
    const add = (opts: SelectOption[]): boolean => {
        for (const opt of opts) {
            if (opt.value === parent) {
                const newChild = { label: value, value: value.toLowerCase().replace(/\s+/g, '-') };
                opt.children = [...(opt.children ?? []), newChild];
                return true;
            }
            if (opt.children && add(opt.children)) return true;
        }
        return false;
    };
    add(creatorOptions);
}

// --- Async demo ---
const allUsers: SelectOption[] = Array.from({ length: 500 }, (_, i) => ({
    value: `u-${i}`,
    label: `${['Alice', 'Bob', 'Carol', 'Dan', 'Eve'][i % 5]} ${['Smith', 'Jones', 'Lee', 'Park'][i % 4]} (#${i})`
}));
const asyncOptions = ref<SelectOption[]>([]);
const asyncLoading = ref(false);
const asyncValue = ref<string | null>(null);
let asyncToken = 0;

async function onAsyncSearch(query: string) {
    const token = ++asyncToken;
    if (!query) {
        asyncOptions.value = [];
        return;
    }
    asyncLoading.value = true;
    await new Promise((r) => setTimeout(r, 350));
    if (token !== asyncToken) return;
    const q = query.toLowerCase();
    asyncOptions.value = allUsers.filter((u) => u.label.toLowerCase().includes(q)).slice(0, 30);
    asyncLoading.value = false;
}

// --- Native form demo ---
const formModel = ref<string[]>(['vue', 'go']);
const formResult = ref('');
function onFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    formResult.value = JSON.stringify(Object.fromEntries(
        Array.from(data.keys()).map((k) => [k, data.getAll(k)])
    ), null, 2);
}

const errorMessage = computed(() => (errorValue.value ? '' : 'Please pick a fruit.'));
</script>

<template>
    <div class="page">
        <header class="page-header">
            <div>
                <h1>Vue Select Plus — Playground</h1>
                <p class="muted">Live sandbox for every feature. Switch the theme to try light, dark, and forced-colors.</p>
            </div>
            <div class="theme-switch" role="group" aria-label="Theme">
                <label v-for="t in (['system', 'light', 'dark'] as Theme[])" :key="t">
                    <input v-model="theme" type="radio" :value="t" />
                    <span>{{ t }}</span>
                </label>
            </div>
        </header>

        <section class="grid">
            <article class="card">
                <h2>Single select</h2>
                <VSelect
                    v-model="singleValue"
                    :options="fruits"
                    label="Pick a fruit"
                    placeholder="Choose…"
                    clearable
                />
                <pre>{{ singleValue }}</pre>
            </article>

            <article class="card">
                <h2>Multi select</h2>
                <VSelect
                    v-model="multiValue"
                    :options="fruits"
                    label="Favorite fruits"
                    multiple
                    clearable
                />
                <pre>{{ multiValue }}</pre>
            </article>

            <article class="card">
                <h2>Searchable (client-side)</h2>
                <VSelect
                    v-model="searchableValue"
                    :options="fruits"
                    label="Search fruits"
                    placeholder="Type to filter…"
                    searchable
                    clearable
                />
                <pre>{{ searchableValue }}</pre>
            </article>

            <article class="card">
                <h2>Async / server-driven search</h2>
                <VSelect
                    v-model="asyncValue"
                    :options="asyncOptions"
                    :loading="asyncLoading"
                    :filterable="false"
                    :min-search-length="2"
                    :search-debounce="300"
                    label="Search users"
                    placeholder="Type at least 2 chars…"
                    searchable
                    @search="onAsyncSearch"
                />
                <pre>{{ asyncValue ?? 'none' }}</pre>
            </article>

            <article class="card">
                <h2>Tree (nested + searchable + multi)</h2>
                <VSelect
                    v-model="treeValue"
                    :options="techStack"
                    label="Tech stack"
                    multiple
                    searchable
                />
                <pre>{{ treeValue }}</pre>
            </article>

            <article class="card">
                <h2>Creator mode</h2>
                <VSelect
                    v-model="creatorValue"
                    :options="creatorOptions"
                    label="Add a child item"
                    placeholder="Hover a group, hit +"
                    @create="handleCreate"
                />
                <p class="muted small">
                    Hover any group with children — a <kbd>+</kbd> button appears. Click it to add a new
                    item under that group.
                </p>
            </article>

            <article class="card">
                <h2>Validation</h2>
                <VSelect
                    v-model="errorValue"
                    :options="fruits"
                    label="Required field"
                    required
                    :error="errorMessage"
                />
                <p class="muted small">
                    The combobox reports <code>aria-invalid</code> + <code>aria-describedby</code> when
                    an error is set.
                </p>
            </article>

            <article class="card">
                <h2>Clearable</h2>
                <VSelect
                    v-model="clearableValue"
                    :options="fruits"
                    label="Clearable single"
                    clearable
                />
                <pre>{{ clearableValue ?? 'cleared' }}</pre>
            </article>

            <article class="card">
                <h2>Virtualized 5 000 items</h2>
                <VSelect
                    v-model="longValue"
                    :options="longList"
                    label="Pick anything"
                    searchable
                    placeholder="Item 0000 → 4999"
                />
                <pre>{{ longValue ?? '—' }}</pre>
            </article>

            <article class="card span-2">
                <h2>Native form integration</h2>
                <form class="demo-form" @submit="onFormSubmit">
                    <VSelect
                        v-model="formModel"
                        :options="techStack"
                        label="Stack"
                        name="stack"
                        multiple
                        searchable
                    />
                    <button type="submit">Submit form</button>
                </form>
                <pre v-if="formResult">{{ formResult }}</pre>
                <p v-else class="muted small">
                    Pick a couple of options and submit — the result will appear here as it would
                    arrive on the server.
                </p>
            </article>
        </section>

        <footer class="page-footer">
            <span class="muted small">
                Built with Vue {{ '3' }} · Open the console and inspect any combobox to see the ARIA tree.
            </span>
        </footer>
    </div>
</template>

<style>
@import '@vue-select-plus/styles';

:root {
    color-scheme: light dark;
    --pg-bg: #fafafa;
    --pg-card: #ffffff;
    --pg-border: #e5e7eb;
    --pg-text: #111827;
    --pg-text-muted: #6b7280;
    --pg-radius: 10px;
}

/* Class-driven dark mode — matches Vue Select Plus' theming model. */
:root.dark {
    --pg-bg: #0b1220;
    --pg-card: #111827;
    --pg-border: #1f2937;
    --pg-text: #f9fafb;
    --pg-text-muted: #9ca3af;
}

html, body {
    margin: 0;
    padding: 0;
    background: var(--pg-bg);
    color: var(--pg-text);
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page {
    max-inline-size: 1280px;
    margin-inline: auto;
    padding: 2rem 1.5rem 4rem;
}

.page-header {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-block-end: 2rem;
}

.page-header h1 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
    font-weight: 700;
}

.muted {
    color: var(--pg-text-muted);
}

.small {
    font-size: 0.85rem;
}

.theme-switch {
    display: inline-flex;
    border: 1px solid var(--pg-border);
    border-radius: 999px;
    overflow: hidden;
    background: var(--pg-card);
}

.theme-switch label {
    position: relative;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    text-transform: capitalize;
    cursor: pointer;
    user-select: none;
}

.theme-switch input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
}

.theme-switch input:checked + span {
    color: #fff;
}

.theme-switch input:checked + span::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #2563eb;
    border-radius: 999px;
    z-index: -1;
}

.theme-switch span {
    position: relative;
    z-index: 1;
}

.theme-switch input:focus-visible + span {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
}

.card {
    background: var(--pg-card);
    border: 1px solid var(--pg-border);
    border-radius: var(--pg-radius);
    padding: 1.25rem;
}

.card h2 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
}

.card pre {
    background: rgba(0, 0, 0, 0.04);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    margin-block-start: 0.75rem;
    overflow-x: auto;
    color: var(--pg-text);
}

.span-2 {
    grid-column: span 2;
}

@media (max-width: 720px) {
    .span-2 {
        grid-column: span 1;
    }
}

.demo-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
}

.demo-form button {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #fff;
    font: inherit;
    cursor: pointer;
}

.demo-form button:hover {
    background: #1d4ed8;
}

kbd {
    display: inline-block;
    padding: 0 0.25rem;
    border: 1px solid var(--pg-border);
    border-radius: 4px;
    font: inherit;
    font-size: 0.75rem;
    background: var(--pg-bg);
}

code {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: 0.85rem;
    padding: 0 0.25rem;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 3px;
}

.page-footer {
    margin-block-start: 2rem;
    text-align: center;
}
</style>
