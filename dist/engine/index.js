'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const META = Symbol();
const RECORD = Symbol();
const USEABLE = Symbol();
const createTarget = (meta, onSet = (meta, value) => {
    meta.node = value;
    meta.root.notify();
}) => {
    return function (input) {
        if (arguments.length === 0)
            return meta.node;
        const nextValue = typeof input === 'function' ? input(meta.node) : input;
        if (meta.node === nextValue)
            return;
        onSet(meta, nextValue);
    };
};
const createRoot = () => {
    const listeners = new Set();
    const notify = (value) => listeners.forEach((listener) => listener(value));
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    return { notify, subscribe };
};
const createSelector = (store, init) => {
    const unsubs = new Set();
    const getter = (store) => {
        unsubs.add(subscribe(store, updateState));
        return store();
    };
    const updateState = () => {
        unsubs.forEach((fn) => fn());
        unsubs.clear();
        const result = init(getter);
        store(result);
    };
    updateState();
};
const createSubscribe = (effect) => (store, fn) => {
    // cleanup + runCleanup
    let cleanup;
    const runCleanup = () => {
        if (cleanup && typeof cleanup === 'function')
            cleanup();
        cleanup = undefined;
    };
    // Listener
    let prevValue = store();
    const listener = () => {
        const nextValue = store();
        if (nextValue !== prevValue) {
            runCleanup();
            cleanup = fn(nextValue, prevValue);
            prevValue = nextValue;
        }
    };
    // If it's an effect, also collect the cleanup value at the first run
    if (effect)
        cleanup = fn(prevValue, prevValue);
    // Actually subscribe internally
    const unsub = store[META].root.subscribe(listener);
    // Return unsub
    return () => {
        runCleanup();
        unsub();
    };
};
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
const subscribe = createSubscribe(false);
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
const effect = createSubscribe(true);

exports.META = META;
exports.RECORD = RECORD;
exports.USEABLE = USEABLE;
exports.createRoot = createRoot;
exports.createSelector = createSelector;
exports.createTarget = createTarget;
exports.effect = effect;
exports.subscribe = subscribe;
