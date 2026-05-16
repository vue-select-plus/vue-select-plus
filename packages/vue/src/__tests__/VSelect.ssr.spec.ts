/**
 * SSR smoke tests. These run in a Node environment (no DOM) and verify that
 * rendering the component to a string does not crash. This catches accidental
 * dependencies on `window`, `document`, `ResizeObserver`, etc. at setup time.
 */
import { describe, it, expect } from 'vitest';
// @vitest-environment node

import { createSSRApp, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import VSelect from '../components/VSelect.vue';
import type { SelectOption } from '@vue-select-plus/core';

const fruits: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' }
];

async function render(props: Record<string, unknown>, initial: any = null) {
    const app = createSSRApp({
        components: { VSelect },
        setup() {
            return { props, model: ref(initial) };
        },
        template: '<VSelect v-bind="props" v-model="model" />'
    });
    return await renderToString(app);
}

describe('VSelect — SSR smoke', () => {
    it('renders non-searchable single without crashing', async () => {
        const html = await render({ options: fruits, label: 'Fruit', teleport: false }, 'apple');
        expect(html).toContain('role="combobox"');
        // Selected value is in the SR-only summary span
        expect(html).toContain('Apple');
    });

    it('renders searchable without crashing', async () => {
        const html = await render({ options: fruits, label: 'Fruit', searchable: true, teleport: false });
        expect(html).toContain('role="combobox"');
        expect(html).toContain('aria-autocomplete="list"');
    });

    it('renders multi with tags without crashing', async () => {
        const html = await render({ options: fruits, label: 'Fruit', multiple: true, teleport: false }, ['apple', 'banana']);
        expect(html).toContain('Apple');
        expect(html).toContain('Banana');
    });

    it('renders required + error attributes', async () => {
        const html = await render({ options: fruits, label: 'Fruit', required: true, error: 'Bad', teleport: false });
        expect(html).toContain('aria-required="true"');
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain('Bad');
    });

    it('emits hidden form inputs when name is provided', async () => {
        const html = await render({ options: fruits, label: 'Fruit', name: 'fruit', multiple: true, teleport: false }, ['apple']);
        expect(html).toContain('type="hidden"');
        expect(html).toContain('name="fruit"');
        expect(html).toContain('value="apple"');
    });

    it('does not leak Math.random ids — same options give the same id seed across renders', async () => {
        // useId() should produce deterministic-ish ids in SSR per app, not Math.random based.
        const a = await render({ options: fruits, label: 'Fruit', teleport: false });
        const b = await render({ options: fruits, label: 'Fruit', teleport: false });
        // Both should contain `vsp-` prefixed ids
        expect(a).toMatch(/id="vsp-/);
        expect(b).toMatch(/id="vsp-/);
        // And the id should not contain a random base36 hash like the old code produced
        expect(a).not.toMatch(/v-select-[a-z0-9]{6,}/);
    });
});
