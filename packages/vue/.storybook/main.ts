import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [],
  "framework": "@storybook/vue3-vite",
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
          '@vue-select-plus/core': fileURLToPath(new URL('../../core/src/index.ts', import.meta.url)),
          '@vue-select-plus/vue': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
          '@vue-select-plus/styles': fileURLToPath(new URL('../../styles/src/style.css', import.meta.url))
        }
      }
    });
  }
};
export default config;