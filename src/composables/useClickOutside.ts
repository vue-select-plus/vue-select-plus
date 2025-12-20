import { onMounted, onBeforeUnmount, type Ref, unref } from 'vue';

type MaybeRef<T> = T | Ref<T>;

/**
 * Detects clicks outside of the specified target element(s) and triggers a callback.
 * Useful for closing dropdowns or modals.
 * * @param targets - A single ref/element or an array of refs/elements to monitor.
 * @param handler - The callback function to execute when a click outside occurs.
 */
export function useClickOutside(
    targets: MaybeRef<HTMLElement | null> | MaybeRef<HTMLElement | null>[],
    handler: (event: MouseEvent | TouchEvent) => void
) {
    const listener = (event: MouseEvent | TouchEvent) => {
        const targetNodes = Array.isArray(targets) ? targets : [targets];

        const isInside = targetNodes.some((ref) => {
            const el = unref(ref);
            return el && (event.target === el || el.contains(event.target as Node));
        });

        if (!isInside) {
            handler(event);
        }
    };

    onMounted(() => {
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
    });
}