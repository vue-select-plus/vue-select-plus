import VSelect from './components/VSelect.vue';
import VSelectOption from './components/VSelectOption.vue';

export { VSelect, VSelectOption };
export default VSelect;

/**
 * Re-export Floating UI's placement type so consumers don't have to add
 * `@floating-ui/vue` as a direct dependency just to type the `placement` prop.
 */
export type { Placement } from '@floating-ui/vue';

/**
 * Public types from the core package, re-exported for convenience.
 */
export type {
    SelectOption,
    SelectValue,
    SelectModelValue
} from '@vue-select-plus/core';
