import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, defineComponent, h, nextTick } from 'vue';
import VSelect from '../components/VSelect.vue';
import type { SelectOption } from '@vue-select-plus/core';

const fruits: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true }
];

function makeHost(propsFactory: () => Record<string, unknown>, initial: any = null) {
    return defineComponent({
        components: { VSelect },
        setup() {
            const model = ref(initial);
            const events = ref<Array<{ type: string; payload?: unknown }>>([]);
            const props = propsFactory();
            return () =>
                h(VSelect, {
                    ...props,
                    modelValue: model.value,
                    'onUpdate:modelValue': (v: unknown) => (model.value = v as any),
                    onOpen: () => events.value.push({ type: 'open' }),
                    onClose: () => events.value.push({ type: 'close' }),
                    onSearch: (q: string) => events.value.push({ type: 'search', payload: q })
                });
        }
    });
}

describe('VSelect — selection behavior', () => {
    it('clicking an option in single mode selects it and closes', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', teleport: false }));
        const wrapper = mount(Host);

        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();

        const banana = wrapper.findAll('[role="option"]').find(o => o.text().includes('Banana'))!;
        await banana.trigger('click');
        await flushPromises();

        // Menu closes
        expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
        // Combobox now references the value-summary that includes "Banana"
        const btn = wrapper.find('[role="combobox"]');
        const ids = btn.attributes('aria-labelledby')!.split(' ');
        const text = ids.map(id => wrapper.find(`#${id}`).text()).join(' ');
        expect(text).toContain('Banana');
    });

    it('skips disabled options on click', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', teleport: false }));
        const wrapper = mount(Host);
        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        const date = wrapper.findAll('[role="option"]').find(o => o.text().includes('Date'))!;
        await date.trigger('click');
        await flushPromises();
        // Menu stayed open because disabled options are not selectable
        expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('multi: clicking toggles values and keeps the menu open', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', multiple: true, teleport: false }), []);
        const wrapper = mount(Host);

        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();

        const apple = wrapper.findAll('[role="option"]').find(o => o.text().includes('Apple'))!;
        await apple.trigger('click');
        await flushPromises();

        // Menu stays open
        expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

        // Two tags visible
        const cherry = wrapper.findAll('[role="option"]').find(o => o.text().includes('Cherry'))!;
        await cherry.trigger('click');
        await flushPromises();
        const tags = wrapper.findAll('.vue-select-tag');
        expect(tags.length).toBe(2);
    });

    it('keyboard: Enter on closed combobox opens it', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', teleport: false }));
        const wrapper = mount(Host);
        const root = wrapper.find('.vue-select-root');
        await root.trigger('keydown', { key: 'Enter' });
        await flushPromises();
        expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('keyboard: Escape closes the menu', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', teleport: false }));
        const wrapper = mount(Host);
        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
        await wrapper.find('.vue-select-root').trigger('keydown', { key: 'Escape' });
        await flushPromises();
        expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    });
});

describe('VSelect — native form integration', () => {
    it('emits a single hidden input per selected value', async () => {
        const Host = defineComponent({
            components: { VSelect },
            setup() {
                const model = ref(['apple', 'banana']);
                return () =>
                    h('form', {}, [
                        h(VSelect, {
                            options: fruits,
                            label: 'Fruit',
                            name: 'fruit',
                            multiple: true,
                            teleport: false,
                            modelValue: model.value,
                            'onUpdate:modelValue': (v: unknown) => (model.value = v as any)
                        })
                    ]);
            }
        });
        const wrapper = mount(Host, { attachTo: document.body });
        await flushPromises();
        const hidden = wrapper.findAll('input[type="hidden"][name="fruit"]');
        expect(hidden.length).toBe(2);
        expect(hidden.map(i => (i.element as HTMLInputElement).value)).toEqual(['apple', 'banana']);
        wrapper.unmount();
    });

    it('emits an empty hidden input when nothing is selected', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', name: 'fruit', teleport: false }), null);
        const wrapper = mount(Host);
        await flushPromises();
        const hidden = wrapper.findAll('input[type="hidden"][name="fruit"]');
        expect(hidden.length).toBe(1);
        expect((hidden[0]!.element as HTMLInputElement).value).toBe('');
    });
});

describe('VSelect — loading + search', () => {
    it('shows loading state inside the menu', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', loading: true, searchable: true, teleport: false }));
        const wrapper = mount(Host);
        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        expect(wrapper.find('.vue-select-state--loading').exists()).toBe(true);
    });

    it('shows the type-to-search hint below minSearchLength', async () => {
        const Host = makeHost(() => ({
            options: fruits,
            label: 'Fruit',
            searchable: true,
            minSearchLength: 3,
            teleport: false
        }));
        const wrapper = mount(Host);
        await wrapper.find('[role="combobox"]').trigger('click');
        const input = wrapper.find<HTMLInputElement>('input[role="combobox"]');
        await input.setValue('ab');
        await flushPromises();
        expect(wrapper.find('.vue-select-state').exists()).toBe(true);
        expect(wrapper.find('.vue-select-state').text()).toMatch(/at least 3/i);
    });
});

describe('VSelect — HTML5 validation', () => {
    it('renders a validation input that is invalid while required + empty', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', required: true, teleport: false }), null);
        const wrapper = mount(Host, { attachTo: document.body });
        await flushPromises();
        await nextTick();

        const validation = wrapper.find<HTMLInputElement>('input.vue-select-validation');
        expect(validation.exists()).toBe(true);
        expect(validation.element.validationMessage).not.toBe('');
        expect(validation.element.validity.valid).toBe(false);
        wrapper.unmount();
    });

    it('clears validity once a value is selected', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', required: true, teleport: false }), null);
        const wrapper = mount(Host, { attachTo: document.body });
        await flushPromises();
        await nextTick();

        const validation = wrapper.find<HTMLInputElement>('input.vue-select-validation');
        expect(validation.element.validity.valid).toBe(false);

        await wrapper.find('[role="combobox"]').trigger('click');
        await flushPromises();
        const apple = wrapper.findAll('[role="option"]').find(o => o.text().includes('Apple'))!;
        await apple.trigger('click');
        await flushPromises();
        await nextTick();

        expect(validation.element.validity.valid).toBe(true);
        wrapper.unmount();
    });

    it('skips validation surface when validateOnSubmit is false', () => {
        const Host = makeHost(() => ({
            options: fruits,
            label: 'Fruit',
            required: true,
            validateOnSubmit: false,
            teleport: false
        }));
        const wrapper = mount(Host);
        expect(wrapper.find('input.vue-select-validation').exists()).toBe(false);
    });
});

describe('VSelect — clearable', () => {
    it('clear button resets to undefined in single mode', async () => {
        const Host = makeHost(() => ({ options: fruits, label: 'Fruit', clearable: true, teleport: false }), 'banana');
        const wrapper = mount(Host);
        await flushPromises();
        const clear = wrapper.find('button[aria-label="Clear selection"]');
        expect(clear.exists()).toBe(true);
        await clear.trigger('click');
        await nextTick();
        // After clear, the value-summary span should show the placeholder
        const btn = wrapper.find('[role="combobox"]');
        const valueId = btn.attributes('aria-labelledby')!.split(' ').pop()!;
        expect(wrapper.find(`#${valueId}`).text()).not.toContain('Banana');
    });
});
