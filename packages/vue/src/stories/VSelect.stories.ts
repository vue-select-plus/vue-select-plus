import type { Meta, StoryObj } from '@storybook/vue3';
import { ref, reactive } from 'vue';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import VSelect from '../components/VSelect.vue';
import type { SelectOption } from '@vue-select-plus/core';

import "@vue-select-plus/styles"

// --- MOCK DATA ---
const fruitOptions: SelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true },
    { value: 'grape', label: 'Grape' },
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

// Generate 1000 items
const longListOptions = Array.from({ length: 1000 }, (_, i) => ({
    label: `Item ${i + 1}`,
    value: `item-${i + 1}`
}));

const meta: Meta<typeof VSelect> = {
    title: 'Components/VSelect',
    component: VSelect,
    tags: ['autodocs'],
    argTypes: {
        modelValue: { control: 'object' },
        disabled: { control: 'boolean' },
        searchable: { control: 'boolean' },
        multiple: { control: 'boolean' },
    },
    args: {
        onCreate: fn(),
        'onUpdate:modelValue': fn(),
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
        placeholder: 'Select fruit...',
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Open
        await userEvent.click(canvas.getByRole('combobox'));

        // Select 'Banana' explicitly from the listbox (role=option)
        // Use findByRole to wait for virtualizer render
        const listbox = canvas.getByRole('listbox');
        const bananaOption = await within(listbox).findByRole('option', { name: 'Banana' });
        await userEvent.click(bananaOption);

        // Verify Trigger Text
        const trigger = canvas.getByRole('combobox');
        await expect(trigger).toHaveTextContent('Banana');
    }
};

export const Multiple: Story = {
    args: {
        options: fruitOptions,
        label: 'Favorite Fruits',
        multiple: true,
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            const model = ref(['apple']);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');

        // 1. Check initial Tag (Scope to trigger to avoid finding dropdown items)
        await expect(within(trigger).getByText('Apple')).toBeInTheDocument();

        // 2. Open Dropdown
        await userEvent.click(trigger);

        // 3. Select 'Grape' (Scope to listbox to avoid finding tags)
        const listbox = canvas.getByRole('listbox');
        const grapeOption = await within(listbox).findByRole('option', { name: 'Grape' });
        await userEvent.click(grapeOption);

        // 4. Verify both tags present in trigger
        await expect(within(trigger).getByText('Apple')).toBeInTheDocument();
        await expect(within(trigger).getByText('Grape')).toBeInTheDocument();

        // 5. Remove Apple via Tag "x" button
        const appleTag = within(trigger).getByText('Apple').closest('.vue-select-tag');
        if (appleTag) {
            const removeBtn = within(appleTag as HTMLElement).getByRole('button');
            await userEvent.click(removeBtn);
        }

        // 6. Verify Apple gone
        await expect(within(trigger).queryByText('Apple')).not.toBeInTheDocument();
    }
};

export const Searchable: Story = {
    args: {
        options: fruitOptions,
        label: 'Filter Fruits',
        searchable: true,
        placeholder: 'Pick one...',
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');

        // 1. Open
        await userEvent.click(trigger);

        // 2. Find Input - Should have placeholder "Pick one..." (from args) NOT "Search..."
        const input = await canvas.findByPlaceholderText('Pick one...');

        // 3. Type "err"
        await userEvent.type(input, 'err');

        // 4. Check Cherry is visible
        const listbox = canvas.getByRole('listbox');
        await expect(await within(listbox).findByRole('option', { name: 'Cherry' })).toBeInTheDocument();

        // 5. Banana should be hidden
        await waitFor(() => {
            expect(within(listbox).queryByRole('option', { name: 'Banana' })).not.toBeInTheDocument();
        });

        // 6. Select Cherry
        await userEvent.click(await within(listbox).findByRole('option', { name: 'Cherry' }));
        await expect(trigger).toHaveTextContent('Cherry');
    }
};

export const ComplexCombination: Story = {
    args: {
        options: nestedComplex,
        label: 'Tech Stack',
        multiple: true,
        searchable: true,
        placeholder: 'Search technologies...',
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            const model = ref(['vue']); // Initial value deep nested
            // Deep clone to allow modification without affecting other stories
            const localOptions = reactive(JSON.parse(JSON.stringify(nestedComplex)));

            function handleCreate({ parent, value }: { parent: string, value: string }) {
                // Recursive add
                const add = (opts: any[]) => {
                    for (const opt of opts) {
                        if (String(opt.value) === String(parent)) {
                            // Simple ID generation
                            const newValue = value.toLowerCase().replace(/\s+/g, '-');
                            const newChild = { label: value, value: newValue };
                            // Ensure children array exists
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
        template: '<VSelect v-bind="args" :options="localOptions" v-model="model" @create="handleCreate" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');

        // 1. Verify 'Vue' tag is present (requires recursive label lookup to work!)
        await expect(within(trigger).getByText('Vue')).toBeInTheDocument();

        // 2. Open & Search
        await userEvent.click(trigger);
        const input = canvasElement.querySelector('input');
        if (input) await userEvent.type(input, 'nest');

        // 3. Select NestJS
        const listbox = canvas.getByRole('listbox');
        const nestOption = await within(listbox).findByRole('option', { name: 'NestJS' });
        await userEvent.click(nestOption);

        // 4. Verify both
        await expect(within(trigger).getByText('NestJS')).toBeInTheDocument();
    }
};

export const CreatorMode: Story = {
    args: {
        options: nestedComplex,
        label: 'Add Custom Item',
        placeholder: 'Click + on Backend',
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            const model = ref(null);
            const localOptions = reactive(JSON.parse(JSON.stringify(nestedComplex)));

            function handleCreate({ parent, value }: { parent: string, value: string }) {
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
        <VSelect 
          v-bind="args" 
          :options="localOptions"
          v-model="model" 
          @create="handleCreate"
        />
      `,
    }),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole('combobox'));

        // Find Add button. Using title selector as per CSS/Template
        // We select the first update button which corresponds to "Backend"
        const addButtons = canvasElement.querySelectorAll('button[title="Add child"]');
        const backendAddBtn = addButtons[0] as HTMLElement;

        await userEvent.click(backendAddBtn);

        // Input should appear
        const input = await canvas.findByPlaceholderText('New item...');
        await expect(input).toHaveFocus();

        await userEvent.type(input, 'Ruby');
        await userEvent.keyboard('{Enter}');

        // Wait for update
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
        placeholder: 'Nothing to see here',
    },
    render: (args) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
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
        disabled: true,
    },
    render: (args) => ({
        components: { VSelect },
        setup() {
            // Pre-selected value to verify it's displayed but immutable
            const model = ref('apple');
            return { args, model };
        },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');
        const root = canvasElement.querySelector('.vue-select-root');

        await expect(within(trigger).getByText('Apple')).toBeInTheDocument();

        // Verify Disabled State
        await expect(root).toHaveClass('is-disabled');

        // Ensure it is closed
        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();

        // Optionally verify styling (pointer-events) if possible, but class check is sufficient logic 
        // to prove "Disabled" prop was applied.
    }
};

export const DisabledOption: Story = {
    args: {
        options: fruitOptions, // Contains 'Date' which is disabled
        label: 'Disabled Option',
    },
    render: (args) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));

        const listbox = canvas.getByRole('listbox');
        const dateOption = await within(listbox).findByRole('option', { name: 'Date' });

        // Should have aria-disabled or class - but let's just try to click it
        // The implementation checks (!option.disabled) on click, so verify nothing happens
        await userEvent.click(dateOption);

        // Trigger should still match placeholder, not 'Date'
        const trigger = canvas.getByRole('combobox');
        await expect(trigger).not.toHaveTextContent('Date');

        // Select Apple to verify it still works
        await userEvent.click(await within(listbox).findByRole('option', { name: 'Apple' }));
        await expect(trigger).toHaveTextContent('Apple');
    }
};

export const KeyboardNavigation: Story = {
    args: {
        options: fruitOptions,
        label: 'Keyboard Nav',
        placeholder: 'Use arrows...',
    },
    render: (args) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');

        // 1. Focus
        trigger.focus();
        await expect(trigger).toHaveFocus();

        // 2. Enter to Open (Auto-highlights first option: Apple)
        await userEvent.keyboard('{Enter}');
        const listbox = await canvas.findByRole('listbox');
        await expect(listbox).toBeVisible();

        // 3. Arrow Down -> Banana (Index 1)
        await userEvent.keyboard('{ArrowDown}');

        // 4. Enter to Select
        await userEvent.keyboard('{Enter}');

        // Verify Banana Selected
        const bananaText = await within(trigger).findByText('Banana');
        await expect(bananaText).toBeInTheDocument();

        // 5. Verify Closed
        await expect(listbox).not.toBeVisible();
    }
};

export const KeyboardSelectionBug: Story = {
    args: {
        options: fruitOptions,
        label: 'Keyboard Selection Bug',
    },
    render: (args) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('combobox');

        // 1. Select Banana
        await userEvent.click(trigger);
        const listbox = canvas.getByRole('listbox');
        const bananaOption = await within(listbox).findByRole('option', { name: 'Banana' });
        await userEvent.click(bananaOption);
        await expect(trigger).toHaveTextContent('Banana');

        // 2. Open again (Enter)
        trigger.focus(); // Ensure focus
        await userEvent.keyboard('{Enter}');

        // 3. Arrow Down. 
        // Logic: Starts at Banana (Index 1) -> Moves to Cherry (Index 2).
        await userEvent.keyboard('{ArrowDown}');

        // 4. Select
        await userEvent.keyboard('{Enter}');

        // Expect Cherry
        await expect(trigger).toHaveTextContent('Cherry');
    }
};

export const LongList: Story = {
    args: {
        options: longListOptions,
        label: '1000 Items (Virtual)',
        searchable: true,
    },
    render: (args) => ({
        components: { VSelect },
        setup() { return { args, model: ref(null) }; },
        template: '<VSelect v-bind="args" v-model="model" />',
    }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('combobox'));

        const listbox = await canvas.findByRole('listbox');

        // Verify we only see a subset (virtualization)
        // TanStack virtual default 40px estimated height, overscan 5. 
        // We can just check that 'Item 1' is there
        await expect(await within(listbox).findByRole('option', { name: 'Item 1' })).toBeVisible();
        // And 'Item 999' should NOT be in the document (or not visible) initially
        await expect(within(listbox).queryByRole('option', { name: 'Item 999' })).not.toBeInTheDocument();
    }
};