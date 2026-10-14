// Runs in the page's own context so YouTube believes the tab is always visible,
// which keeps it loading more history while another tab is in front.
(() => {
    const define = (obj, prop, value) =>
        Object.defineProperty(obj, prop, { get: () => value, configurable: true });
    define(Document.prototype, 'hidden', false);
    define(Document.prototype, 'visibilityState', 'visible');
    document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
    window.addEventListener('blur', (e) => e.stopImmediatePropagation(), true);
})();
