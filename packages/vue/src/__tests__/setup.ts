// jsdom doesn't implement these, but Floating UI and TanStack Virtual touch them.
class ResizeObserverStub {
    observe() { /* noop */ }
    unobserve() { /* noop */ }
    disconnect() { /* noop */ }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as any).ResizeObserver = ResizeObserverStub;
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
    // @ts-expect-error — minimal stub
    Element.prototype.scrollTo = function () { /* noop */ };
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () { /* noop */ };
}

// jsdom returns 0 for client/scroll/offsetWidth+Height of every element — Floating UI
// needs a non-zero rect to position the menu. Provide a deterministic stub.
function patchRectMetrics() {
    const fakeRect = {
        x: 0, y: 0, top: 0, right: 200, bottom: 40, left: 0,
        width: 200, height: 40,
        toJSON() { return this; }
    };

    if (typeof Element !== 'undefined') {
        const proto = Element.prototype as any;
        if (!proto.__vsp_rect_patched__) {
            proto.getBoundingClientRect = function () { return { ...fakeRect }; };
            proto.__vsp_rect_patched__ = true;
        }
    }

    // Tanstack Virtual reads `clientHeight` / `scrollHeight` to compute the visible
    // window. jsdom defaults both to 0 so nothing renders. Force a reasonable height
    // so the virtualizer always renders at least a few rows in tests.
    if (typeof HTMLElement !== 'undefined') {
        const proto = HTMLElement.prototype as any;
        if (!proto.__vsp_size_patched__) {
            Object.defineProperty(proto, 'clientHeight', {
                configurable: true,
                get() { return 400; }
            });
            Object.defineProperty(proto, 'clientWidth', {
                configurable: true,
                get() { return 200; }
            });
            Object.defineProperty(proto, 'offsetHeight', {
                configurable: true,
                get() { return 400; }
            });
            Object.defineProperty(proto, 'offsetWidth', {
                configurable: true,
                get() { return 200; }
            });
            proto.__vsp_size_patched__ = true;
        }
    }
}

patchRectMetrics();
