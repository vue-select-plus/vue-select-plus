import { onMounted, onBeforeUnmount, type Ref, unref } from 'vue';

type MaybeRef<T> = T | Ref<T>;

/**
 * Calls `handler` on pointerdowns outside the given target(s). Pass an array
 * when the menu is teleported, so clicks on the menu don't count as outside.
 * Capture-phase so it fires before modal/portal handlers can swallow it.
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
