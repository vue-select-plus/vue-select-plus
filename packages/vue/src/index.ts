import VSelect from './components/VSelect.vue';
import VSelectOption from './components/VSelectOption.vue';

export { VSelect, VSelectOption };
export default VSelect;

/**
 * Floating UI's placement type, re-exported so consumers don't have to add
 * `@floating-ui/vue` as a direct dependency just to type the `placement`
 * prop. Identical to `import type { Placement } from '@floating-ui/vue'`.
 */
export type { Placement } from '@floating-ui/vue';

/**
 * Public types from {@link @vue-select-plus/core}, re-exported so the most
 * common imports stay in one place.
 *
 * - {@link SelectOption}: the shape of each row you pass into `:options`.
 * - {@link SelectValue}: the primitive id type (`string | number`).
 * - {@link SelectModelValue}: the union the component's `v-model` accepts.
 */
export type {
    SelectOption,
    SelectValue,
    SelectModelValue
} from '@vue-select-plus/core';
