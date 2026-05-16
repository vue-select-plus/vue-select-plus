import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, defineComponent, h } from 'vue';
import VSelect from '../components/VSelect.vue';
import type { SelectOption } from '@vue-select-plus/core';

const fruits: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' }
];

function makeHost(props: Record<string, unknown>) {
    return defineComponent({
        components: { VSelect },
        props: { initial: { type: null, default: null } },
        setup(p) {
            const model = ref(p.initial);
            return () => h(VSelect, { ...props, modelValue: model.value, 'onUpdate:modelValue': (v: unknown) => (model.value = v as any) });
        }
    });
}

describe('VSelect — ARIA wiring', () => {
    it('non-searchable: trigger is a <button> with role=combobox', () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', teleport: false }));
        const btn = wrapper.find('[role="combobox"]');
        expect(btn.exists()).toBe(true);
        expect(btn.element.tagName).toBe('BUTTON');
        expect(btn.attributes('aria-haspopup')).toBe('listbox');
        expect(btn.attributes('aria-expanded')).toBe('false');
    });

    it('searchable: trigger is an <input> with role=combobox + aria-autocomplete', () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', searchable: true, teleport: false }));
        const input = wrapper.find('[role="combobox"]');
        expect(input.element.tagName).toBe('INPUT');
        expect(input.attributes('aria-autocomplete')).toBe('list');
    });

    it('non-searchable: aria-labelledby includes label and value summary', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', teleport: false }, ), { props: { initial: 'banana' } });
        await flushPromises();
        const btn = wrapper.find('[role="combobox"]');
        const labelledBy = btn.attributes('aria-labelledby')!;
        expect(labelledBy).toBeTruthy();
        const ids = labelledBy.split(' ');
        // Resolve each id and concatenate the text content — that's the accessible name.
        const accessibleName = ids
            .map(id => wrapper.find(`#${id}`).text())
            .join(' ')
            .trim();
        expect(accessibleName).toContain('Fruit');
        expect(accessibleName).toContain('Banana');
    });

    it('searchable: aria-describedby references the selection summary when input is empty', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', searchable: true, teleport: false }), {
            props: { initial: 'apple' }
        });
        await flushPromises();
        const input = wrapper.find('[role="combobox"]');
        const describedBy = input.attributes('aria-describedby');
        expect(describedBy).toBeTruthy();
        // Find the referenced id and check the value summary is present.
        const valueIds = describedBy!.split(' ');
        const summaries = valueIds.map(id => wrapper.find(`#${id}`).text()).join(' ');
        expect(summaries).toContain('Apple');
    });

    it('searchable: aria-describedby drops the selection summary when the user is typing', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', searchable: true, teleport: false }), {
            props: { initial: 'apple' }
        });
        await flushPromises();
        const input = wrapper.find<HTMLInputElement>('input[role="combobox"]');
        await input.trigger('click');
        await input.setValue('an');
        await flushPromises();

        const describedBy = input.attributes('aria-describedby') ?? '';
        const ids = describedBy.split(' ').filter(Boolean);
        const valueSummary = wrapper.find(`#${wrapper.find('[role="combobox"]').attributes('id')}-value`);
        // value id should NOT appear in describedby while typing
        if (valueSummary.exists()) {
            expect(ids).not.toContain(valueSummary.attributes('id'));
        }
    });

    it('error: combobox reports aria-invalid="true" and links to the error message', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', error: 'Required', teleport: false }));
        await flushPromises();
        const btn = wrapper.find('[role="combobox"]');
        expect(btn.attributes('aria-invalid')).toBe('true');
        const describedBy = btn.attributes('aria-describedby')!;
        const errorEl = wrapper.find(`#${describedBy.split(' ')[0]}`);
        expect(errorEl.text()).toBe('Required');
    });

    it('required: aria-required="true" is reflected', () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', required: true, teleport: false }));
        expect(wrapper.find('[role="combobox"]').attributes('aria-required')).toBe('true');
    });

    it('loading: aria-busy="true" on combobox', () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', loading: true, teleport: false }));
        expect(wrapper.find('[role="combobox"]').attributes('aria-busy')).toBe('true');
    });

    it('multi: announces selection count + labels via aria-labelledby summary', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', multiple: true, teleport: false }), {
            props: { initial: ['apple', 'banana'] }
        });
        await flushPromises();
        const btn = wrapper.find('[role="combobox"]');
        const ids = btn.attributes('aria-labelledby')!.split(' ');
        const text = ids.map(id => wrapper.find(`#${id}`).text()).join(' ');
        expect(text).toContain('Apple');
        expect(text).toContain('Banana');
        expect(text).toMatch(/2 items? selected/);
    });

    it('listbox: opens with aria-multiselectable when multi', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', multiple: true, teleport: false }));
        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        const listbox = wrapper.find('[role="listbox"]');
        expect(listbox.exists()).toBe(true);
        expect(listbox.attributes('aria-multiselectable')).toBe('true');
    });
});

describe('VSelect — disabled', () => {
    it('does not open when disabled', async () => {
        const wrapper = mount(makeHost({ options: fruits, label: 'Fruit', disabled: true, teleport: false }));
        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });
});
