'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var META = Symbol();
var RECORD = Symbol();
var USEABLE = Symbol();
var createTarget = function (get, set) {
    return function (x) {
        if (arguments.length === 0)
            return get();
        var nextValue = typeof x === 'function' ? x(get()) : x;
        if (get() === nextValue)
            return;
        set(nextValue);
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
    var fns = new Set();
    var onCleanup = function (fn) { return void fns.add(fn); };
    var cleanupAll = function () {
        fns.forEach(function (fn) { return fn(); });
        fns.clear();
    };
    return { onCleanup: onCleanup, cleanupAll: cleanupAll };
};
var parseSelector = function (selector) {
    var isPluck = typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol';
    var fn = isPluck ? function (s) { return s[selector]; } : selector;
    return { isPluck: isPluck, fn: fn };
};
function createReadable(atom, selector) {
    if (typeof selector === 'undefined')
        return atom;
    var fn = parseSelector(selector).fn;
    var ans = function () { return fn(atom()); };
    ans[META] = atom[META];
    return ans;
}
var createGetState = function (updateState, onCleanup) {
    // @ts-ignore
    return function (atom, selectorOrSubscribe) {
        if (!atom[META]) {
            // if not a xoid atom, treat as external subscription
            onCleanup(selectorOrSubscribe(updateState));
            return atom();
        }
        var readable = createReadable(atom, selectorOrSubscribe);
        onCleanup(subscribe(readable, updateState));
        return readable();
    };
};
var createSelector = function (atom, init) {
    var _a = createCleanup(), onCleanup = _a.onCleanup, cleanupAll = _a.cleanupAll;
    var updateState = function () {
        cleanupAll();
        var result = init(getter);
        if (atom() === result)
            return;
        var meta = atom[META];
        meta.node = result;
        meta.notifier.notify();
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
exports.USEABLE = USEABLE;
exports.createCleanup = createCleanup;
exports.createGetState = createGetState;
exports.createNotifier = createNotifier;
exports.createReadable = createReadable;
exports.createSelector = createSelector;
exports.createSubscribe = createSubscribe;
exports.createTarget = createTarget;
exports.effect = effect;
exports.parseSelector = parseSelector;
exports.subscribe = subscribe;
