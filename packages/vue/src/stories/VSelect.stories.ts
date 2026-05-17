import type { Meta, StoryObj } from '@storybook/vue3';
import { ref, reactive } from 'vue';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import VSelect from '../components/VSelect.vue';
import type { SelectOption } from '@vue-select-plus/core';

import '@vue-select-plus/styles';

const fruitOptions: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true },
    { value: 'grape', label: 'Grape' }
];

const nestedComplex: SelectOption[] = [
    {
        label: 'Backend',
        value: 'be',
        children: [
            {
                label: 'Node.js',
                value: 'node',
                children: [
                    { label: 'Express', value: 'express' },
                    { label: 'NestJS', value: 'nest' }
                ]
            },
            { label: 'Go', value: 'go' },
            { label: 'Java', value: 'java', disabled: true }
        ]
    },
    {
        label: 'Frontend',
        value: 'fe',
        children: [
            { label: 'Vue', value: 'vue' },
            { label: 'React', value: 'react' },
            { label: 'Angular', value: 'angular' }
        ]
    }
];

const longListOptions = Array.from({ length: 1000 }, (_, i) => ({
    label: `Item ${i + 1}`,
    value: `item-${i + 1}`
}));

const getControl = (canvasElement: HTMLElement) =>
    canvasElement.querySelector('.vue-select-control') as HTMLElement;

const meta: Meta<typeof VSelect> = {
    title: 'Components/VSelect',
    component: VSelect,
    tags: ['autodocs'],
    argTypes: {
        modelValue: { control: 'object' },
        disabled: { control: 'boolean' },
        searchable: { control: 'boolean' },
        multiple: { control: 'boolean' },
        clearable: { control: 'boolean' },
        required: { control: 'boolean' }
    },
    args: {
        onCreate: fn(),
        'onUpdate:modelValue': fn()
    },
    decorators: [
        (story) => ({
            components: { story },
            template: '<div style="min-height: 400px; padding: 2rem; max-width: 500px;"><story /></div>'
        })
    ]
};

export default meta;
type Story = StoryObj<typeof VSelect>;

export const Default: Story = {
    args: {
        options: fruitOptions,
        label: 'Choose a fruit',
        placeholder: 'Select fruit...'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);

        await userEvent.click(canvas.getByRole('combobox'));

        const listbox = canvas.getByRole('listbox');
        const bananaOption = await within(listbox).findByRole('option', { name: 'Banana' });
        await userEvent.click(bananaOption);

        await expect(within(control).getByText('Banana')).toBeInTheDocument();
    }
};

export const Multiple: Story = {
    args: {
        options: fruitOptions,
        label: 'Favorite Fruits',
        multiple: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(['apple']);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const trigger = canvas.getByRole('combobox');

        await expect(within(control).getByText('Apple')).toBeInTheDocument();

        await userEvent.click(trigger);

        const listbox = canvas.getByRole('listbox');
        const grapeOption = await within(listbox).findByRole('option', { name: 'Grape' });
        await userEvent.click(grapeOption);

        await expect(within(control).getByText('Apple')).toBeInTheDocument();
        await expect(within(control).getByText('Grape')).toBeInTheDocument();

        const appleTag = within(control).getByText('Apple').closest('.vue-select-tag') as HTMLElement;
        if (appleTag) {
            const removeBtn = within(appleTag).getByRole('button', { name: /remove apple/i });
            await userEvent.click(removeBtn);
        }

        await expect(within(control).queryByText('Apple')).not.toBeInTheDocument();
    }
};

export const Clearable: Story = {
    args: {
        options: fruitOptions,
        label: 'Clearable',
        clearable: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref('banana');
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);

        await expect(within(control).getByText('Banana')).toBeInTheDocument();
        const clearBtn = canvas.getByRole('button', { name: /clear selection/i });
        await userEvent.click(clearBtn);
        await expect(within(control).queryByText('Banana')).not.toBeInTheDocument();
    }
};

export const Searchable: Story = {
    args: {
        options: fruitOptions,
        label: 'Filter Fruits',
        searchable: true,
        placeholder: 'Pick one...'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const trigger = canvas.getByRole('combobox');

        await userEvent.click(trigger);

        const input = await canvas.findByPlaceholderText('Pick one...');
        await userEvent.type(input, 'err');

        const listbox = canvas.getByRole('listbox');
        await expect(await within(listbox).findByRole('option', { name: 'Cherry' })).toBeInTheDocument();

        await waitFor(() => {
            expect(within(listbox).queryByRole('option', { name: 'Banana' })).not.toBeInTheDocument();
        });

        await userEvent.click(await within(listbox).findByRole('option', { name: 'Cherry' }));
        await expect(within(control).getByText('Cherry')).toBeInTheDocument();
    }
};

export const WithError: Story = {
    args: {
        options: fruitOptions,
        label: 'Required Choice',
        required: true,
        error: 'Please pick a fruit.'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');
        await expect(trigger).toHaveAttribute('aria-invalid', 'true');
        await expect(trigger).toHaveAttribute('aria-required', 'true');
        await expect(canvas.getByText('Please pick a fruit.')).toBeInTheDocument();
    }
};

export const InNativeForm: Story = {
    args: {
        options: fruitOptions,
        label: 'Fruit (form-integrated)',
        name: 'fruit',
        multiple: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(['apple', 'banana']);
            const submitted = ref<string>('');
            function onSubmit(e: Event) {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                submitted.value = data.getAll('fruit').join(',');
            }
            return { args, model, submitted, onSubmit };
        },
        template: `
            <form @submit="onSubmit">
                <VSelect v-bind="args" v-model="model" />
                <button type="submit" style="margin-top:1rem;">Submit</button>
                <p data-testid="submitted">Submitted: {{ submitted }}</p>
            </form>
        `
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
        await waitFor(() => {
            expect(canvas.getByTestId('submitted')).toHaveTextContent('apple,banana');
        });
    }
};

export const ComplexCombination: Story = {
    args: {
        options: nestedComplex,
        label: 'Tech Stack',
        multiple: true,
        searchable: true,
        placeholder: 'Search technologies...'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(['vue']);
            const localOptions = reactive(JSON.parse(JSON.stringify(nestedComplex)));

            function handleCreate({ parent, value }: { parent: string; value: string }) {
                const add = (opts: any[]) => {
                    for (const opt of opts) {
                        if (String(opt.value) === String(parent)) {
                            const newValue = value.toLowerCase().replace(/\s+/g, '-');
                            const newChild = { label: value, value: newValue };
                            opt.children = [...(opt.children || []), newChild];
                            return true;
                        }
                        if (opt.children && add(opt.children)) return true;
                    }
                    return false;
                };
                add(localOptions);
            }

            return { args, model, localOptions, handleCreate };
        },
        template: '<VSelect v-bind="args" :options="localOptions" v-model="model" @create="handleCreate" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const trigger = canvas.getByRole('combobox');

        await expect(within(control).getByText('Vue')).toBeInTheDocument();

        await userEvent.click(trigger);
        const input = canvasElement.querySelector('input.vue-select-input');
        if (input) await userEvent.type(input, 'nest');

        const listbox = canvas.getByRole('listbox');
        const nestOption = await within(listbox).findByRole('option', { name: 'NestJS' });
        await userEvent.click(nestOption);

        await expect(within(control).getByText('NestJS')).toBeInTheDocument();
    }
};

export const CreatorMode: Story = {
    args: {
        options: nestedComplex,
        label: 'Add Custom Item',
        placeholder: 'Click + on Backend',
        creatable: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            const localOptions = reactive(JSON.parse(JSON.stringify(nestedComplex)));

            function handleCreate({ parent, value }: { parent: string; value: string }) {
                if (args.onCreate) args.onCreate({ parent, value });
                const add = (opts: any[]) => {
                    for (const opt of opts) {
                        if (opt.value === parent) {
                            const newChild = { label: value, value: value.toLowerCase() };
                            const currentChildren = opt.children || [];
                            opt.children = [...currentChildren, newChild];
                            return true;
                        }
                        if (opt.children && add(opt.children)) return true;
                    }
                    return false;
                };
                add(localOptions);
            }

            return { args, model, localOptions, handleCreate };
        },
        template: `
            <VSelect v-bind="args" :options="localOptions" v-model="model" @create="handleCreate" />
        `
    }),
    play: async ({ canvasElement, args }: any) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole('combobox'));

        const addButtons = canvasElement.querySelectorAll('button.vue-select-action-btn');
        const backendAddBtn = addButtons[0] as HTMLElement;

        await userEvent.click(backendAddBtn);

        const input = await canvas.findByPlaceholderText('New item...');
        await expect(input).toHaveFocus();

        await userEvent.type(input, 'Ruby');
        await userEvent.keyboard('{Enter}');

        await waitFor(() => {
            expect(canvas.getByText('Ruby')).toBeInTheDocument();
        });

        await expect(args.onCreate).toHaveBeenCalled();
    }
};

export const EmptyState: Story = {
    args: {
        options: [],
        label: 'No Options',
        placeholder: 'Nothing to see here'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));
        await expect(canvas.getByText('No results.')).toBeInTheDocument();
    }
};

export const Disabled: Story = {
    args: {
        options: fruitOptions,
        label: 'Disabled Select',
        placeholder: 'Cannot select',
        disabled: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref('apple');
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const root = canvasElement.querySelector('.vue-select-root');

        await expect(within(control).getByText('Apple')).toBeInTheDocument();
        await expect(root).toHaveClass('is-disabled');
        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    }
};

export const DisabledOption: Story = {
    args: {
        options: fruitOptions,
        label: 'Disabled Option'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));

        const listbox = canvas.getByRole('listbox');
        const dateOption = await within(listbox).findByRole('option', { name: 'Date' });

        await userEvent.click(dateOption);
        await expect(within(control).queryByText('Date')).not.toBeInTheDocument();

        await userEvent.click(await within(listbox).findByRole('option', { name: 'Apple' }));
        await expect(within(control).getByText('Apple')).toBeInTheDocument();
    }
};

export const KeyboardNavigation: Story = {
    args: {
        options: fruitOptions,
        label: 'Keyboard Nav',
        placeholder: 'Use arrows...'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const trigger = canvas.getByRole('combobox');

        trigger.focus();
        await expect(trigger).toHaveFocus();

        await userEvent.keyboard('{Enter}');
        const listbox = await canvas.findByRole('listbox');
        await expect(listbox).toBeVisible();

        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{Enter}');

        await expect(await within(control).findByText('Banana')).toBeInTheDocument();
        await expect(listbox).not.toBeVisible();
    }
};

export const KeyboardSelectionBug: Story = {
    args: {
        options: fruitOptions,
        label: 'Keyboard Selection Bug'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        const control = getControl(canvasElement);
        const trigger = canvas.getByRole('combobox');

        await userEvent.click(trigger);
        const listbox = canvas.getByRole('listbox');
        const bananaOption = await within(listbox).findByRole('option', { name: 'Banana' });
        await userEvent.click(bananaOption);
        await expect(within(control).getByText('Banana')).toBeInTheDocument();

        trigger.focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{Enter}');

        await expect(within(control).getByText('Cherry')).toBeInTheDocument();
    }
};

export const AsyncSearch: Story = {
    args: {
        label: 'Search users (async)',
        searchable: true,
        filterable: false,
        minSearchLength: 2,
        searchDebounce: 300,
        placeholder: 'Type to search…'
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() {
            const model = ref<string | null>(null);
            const options = ref<SelectOption[]>([]);
            const loading = ref(false);

            const allUsers: SelectOption[] = Array.from({ length: 200 }, (_, i) => ({
                value: `u-${i}`,
                label: `User ${String(i).padStart(3, '0')} — ${['Alice', 'Bob', 'Carol', 'Dan'][i % 4]}`
            }));

            let token = 0;
            async function onSearch(query: string) {
                const my = ++token;
                if (!query) {
                    options.value = [];
                    return;
                }
                loading.value = true;
                await new Promise(r => setTimeout(r, 400));
                if (my !== token) return; // race-guard
                const q = query.toLowerCase();
                options.value = allUsers.filter(u => u.label.toLowerCase().includes(q)).slice(0, 50);
                loading.value = false;
            }

            return { args, model, options, loading, onSearch };
        },
        template: `
            <VSelect
                v-bind="args"
                :options="options"
                :loading="loading"
                v-model="model"
                @search="onSearch"
            />
        `
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));
        const input = canvasElement.querySelector('input.vue-select-input') as HTMLInputElement;
        await userEvent.type(input, 'al');
        await waitFor(async () => {
            const listbox = await canvas.findByRole('listbox');
            await within(listbox).findByRole('option', { name: /Alice/i });
        }, { timeout: 2000 });
    }
};

export const LongList: Story = {
    args: {
        options: longListOptions,
        label: '1000 Items (Virtual)',
        searchable: true
    },
    render: (args: any) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />'
    }),
    play: async ({ canvasElement }: any) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));

        const listbox = await canvas.findByRole('listbox');

        await expect(await within(listbox).findByRole('option', { name: 'Item 1' })).toBeVisible();
        await expect(within(listbox).queryByRole('option', { name: 'Item 999' })).not.toBeInTheDocument();
    }
};
