import { onMounted, onBeforeUnmount, type Ref, unref } from 'vue';

type MaybeRef<T> = T | Ref<T>;

/**
 * Detects clicks outside of the specified target element(s) and triggers a callback.
 * Listeners attach in the capture phase so they fire before modal/portal layers
 * can swallow them.
 *
 * Pass an **array** of refs when the menu is teleported — include both the
 * anchor and the floating menu, so clicks on the menu don't count as "outside".
 *
 * @param targets - One ref or an array of refs identifying the "inside" region(s).
 * @param handler - Invoked once per outside pointerdown, before bubble-phase handlers run.
 *
 * @example
 * ```ts
 * useClickOutside([containerRef, menuRef], () => close());
 * ```
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
