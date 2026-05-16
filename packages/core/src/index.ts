/**
 * Public API for @vue-select-plus/core.
 *
 * Only the headless `useSelect` composable, the `useClickOutside` utility,
 * and the type definitions are stable. Internal composables (useKeyboard,
 * useSelection, …) are subject to change without notice.
 */
export { useSelect, type UseSelectProps } from './composables/useSelect';
export { useClickOutside } from './composables/useClickOutside';
export type {
    SelectOption,
    SelectModelValue,
    SelectValue,
    FlatOption
} from './types';
