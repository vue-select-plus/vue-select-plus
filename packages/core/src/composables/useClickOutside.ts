import { onMounted, onBeforeUnmount, type Ref, unref } from 'vue';

type MaybeRef<T> = T | Ref<T>;

/**
 * Detects clicks outside of the specified target element(s) and triggers a callback.
 * Listeners attach in capture phase so they fire before modal/portal layers can swallow them.
 */
export function useClickOutside(
    targets: MaybeRef<HTMLElement | null> | MaybeRef<HTMLElement | null>[],
    handler: (event: PointerEvent | FocusEvent) => void
) {
    const listener = (event: PointerEvent | FocusEvent) => {
        const targetNodes = Array.isArray(targets) ? targets : [targets];
        const target = event.target as Node | null;

        const isInside = targetNodes.some((ref) => {
            const el = unref(ref);
            return el && target !== null && (event.target === el || el.contains(target));
        });

        if (!isInside) handler(event);
    };

    onMounted(() => {
        document.addEventListener('pointerdown', listener, true);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('pointerdown', listener, true);
    });
}
