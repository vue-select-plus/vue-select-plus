import type { Preview } from '@storybook/vue3-vite';
import '@vue-select-plus/styles';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        a11y: {
            // Block the story from being marked "passed" until axe runs against it.
            test: 'todo',
            // Custom axe configuration: tighten to WCAG 2.1 AA + best-practice rules.
            options: {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                }
            }
        },
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#0b1220' },
                { name: 'muted', value: '#f3f4f6' }
            ]
        }
    },
    globalTypes: {
        theme: {
            description: 'Color scheme',
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: [
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' }
                ],
                dynamicTitle: true
            }
        }
    },
    decorators: [
        (story, context) => {
            const theme = (context.globals.theme as 'light' | 'dark') ?? 'light';
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.classList.toggle('light', theme === 'light');
            }
            return { components: { story }, template: '<story />' };
        }
    ]
};

export default preview;
