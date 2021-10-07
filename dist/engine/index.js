'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var META = Symbol();
var RECORD = Symbol();
var USEABLE = Symbol();
var createTarget = function (meta, onSet) {
    if (onSet === void 0) { onSet = function (meta, value) {
        meta.node = value;
        meta.root.notify();
    }; }
    return function (input) {
        if (arguments.length === 0)
            return meta.node;
        var nextValue = typeof input === 'function' ? input(meta.node) : input;
        if (meta.node === nextValue)
            return;
        onSet(meta, nextValue);
    };
};
var createRoot = function () {
    var listeners = new Set();
    var notify = function (value) { return listeners.forEach(function (listener) { return listener(value); }); };
    var subscribe = function (listener) {
        listeners.add(listener);
        return function () { return listeners.delete(listener); };
    };
    return { notify: notify, subscribe: subscribe };
};
var createSelector = function (store, init) {
    var unsubs = new Set();
    var getter = function (store) {
        unsubs.add(subscribe(store, updateState));
        return store();
    };
    var updateState = function () {
        unsubs.forEach(function (fn) { return fn(); });
        unsubs.clear();
        var result = init(getter);
        store(result);
    };
    updateState();
};
var createSubscribe = function (effect) {
    return function (store, fn) {
        // cleanup + runCleanup
        var cleanup;
        var runCleanup = function () {
            if (cleanup && typeof cleanup === 'function')
                cleanup();
            cleanup = undefined;
        };
        // Listener
        var prevValue = store();
        var listener = function () {
            var nextValue = store();
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
        var unsub = store[META].root.subscribe(listener);
        // Return unsub
        return function () {
            runCleanup();
            unsub();
        };
    };
};
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
var subscribe = createSubscribe(false);
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
var effect = createSubscribe(true);

exports.META = META;
exports.RECORD = RECORD;
exports.USEABLE = USEABLE;
exports.createRoot = createRoot;
exports.createSelector = createSelector;
exports.createTarget = createTarget;
exports.effect = effect;
exports.subscribe = subscribe;
