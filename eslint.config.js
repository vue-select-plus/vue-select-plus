import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginA11y from 'eslint-plugin-vuejs-accessibility';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            'docs/.vitepress/cache/**',
            'docs/.vitepress/dist/**',
            'packages/*/dist/**',
            'playground/dist/**'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    ...pluginA11y.configs['flat/recommended'],
    {
        files: ['**/*.{js,ts,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue']
            }
        },
        rules: {
            // We rely on TypeScript's own unused detection (which is stricter).
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-unused-vars': 'off',

            // Allow non-null assertions in tight type-narrowed paths.
            '@typescript-eslint/no-non-null-assertion': 'off',

            // We use `any` sparingly in test factories. Warn, don't fail.
            '@typescript-eslint/no-explicit-any': 'warn',

            // `defineProps` / `defineModel` are macros, not runtime functions.
            'vue/multi-word-component-names': 'off',

            // Vue's strict attribute-order can be noisy and isn't load-bearing.
            'vue/attributes-order': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            'vue/html-indent': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/first-attribute-linebreak': 'off',

            // a11y: enforce label/role/keyboard-handler discipline.
            'vuejs-accessibility/label-has-for': 'off', // We bind for= conditionally based on `searchable`.
            'vuejs-accessibility/click-events-have-key-events': 'off', // Combobox keyboard handling is on root via @keydown.
            'vuejs-accessibility/no-autofocus': 'error',
            'vuejs-accessibility/aria-role': 'error',
            'vuejs-accessibility/role-has-required-aria-props': 'error',

            // `aria-activedescendant` is the correct pattern for combobox + listbox.
            // Options aren't focusable themselves; the combobox holds focus and
            // moves the active descendant programmatically.
            'vuejs-accessibility/interactive-supports-focus': 'off',

            // The visual control wrapper has click/keydown handlers because the
            // focusable element inside it is intentionally 1px (invisible). The
            // real interactive element is the <button>/<input> with role=combobox.
            'vuejs-accessibility/no-static-element-interactions': 'off',

            // Tests / story files allow multiple components per file.
            'vue/one-component-per-file': 'off',
            // Optional props don't need explicit `default` values (TS handles undefined).
            'vue/require-default-prop': 'off'
        }
    },
    {
        files: ['**/__tests__/**', '**/*.spec.ts', '**/*.test.ts', '**/*.stories.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'vuejs-accessibility/click-events-have-key-events': 'off'
        }
    },
    {
        files: ['eslint.config.js', '**/vite.config.ts', '**/vitest.config.ts', '.size-limit.cjs'],
        languageOptions: {
            globals: { ...globals.node }
        }
    },
    {
        // CommonJS configs.
        files: ['**/*.cjs'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: { ...globals.node }
        }
    },
    {
        // Generated types / declaration shims.
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
