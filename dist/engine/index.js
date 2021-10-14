'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var META = Symbol();
var RECORD = Symbol();
var USABLE = Symbol();
var createTarget = function (meta, onSet) {
    if (onSet === void 0) { onSet = function (meta, value) {
        meta.node = value;
        meta.notifier.notify();
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
var createNotifier = function () {
    var listeners = new Set();
    var notify = function (value) { return listeners.forEach(function (listener) { return listener(value); }); };
    var subscribe = function (listener) {
        listeners.add(listener);
        return function () { return listeners.delete(listener); };
    };
    return { listeners: listeners, notify: notify, subscribe: subscribe };
};
var createCleanup = function () {
    var unsubs = new Set();
    var onCleanup = function (fn) { return void unsubs.add(fn); };
    var cleanupAll = function () {
        unsubs.forEach(function (fn) { return fn(); });
        unsubs.clear();
    };
    return { onCleanup: onCleanup, cleanupAll: cleanupAll };
};
var parseSelector = function (selector) {
    var isPluck = typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol';
    return isPluck ? function (s) { return s[selector]; } : selector;
};
function createReadable(atom, selector) {
    var _a;
    if (!selector)
        return atom;
    var fn = parseSelector(selector);
    return Object.assign((function () { return fn(atom()); }), (_a = {}, _a[META] = atom[META], _a));
}
var createGetState = function (updateState, onCleanup) {
    // @ts-ignore
    return function (atom, selector) {
        var readable = createReadable(atom, selector);
        onCleanup(subscribe(readable, updateState));
        return readable();
    };
};
var createSelector = function (atom, init) {
    var _a = createCleanup(), onCleanup = _a.onCleanup, cleanupAll = _a.cleanupAll;
    var updateState = function () {
        cleanupAll();
        var result = init(getter);
        atom(result);
    };
    var getter = createGetState(updateState, onCleanup);
    updateState();
};
var createSubscribe = function (effect) {
    return function (atom, fn) {
        // cleanup + runCleanup
        var cleanup;
        var runCleanup = function () {
            if (cleanup && typeof cleanup === 'function')
                cleanup();
            cleanup = undefined;
        };
        // Listener
        var prevValue = atom();
        var listener = function () {
            var nextValue = atom();
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
        var unsub = atom[META].notifier.subscribe(listener);
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
exports.USABLE = USABLE;
exports.createCleanup = createCleanup;
exports.createGetState = createGetState;
exports.createNotifier = createNotifier;
exports.createReadable = createReadable;
exports.createSelector = createSelector;
exports.createTarget = createTarget;
exports.effect = effect;
exports.parseSelector = parseSelector;
exports.subscribe = subscribe;
