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
        var newValue = typeof input === 'function' ? input(meta.node) : input;
        if (meta.node === newValue)
            return;
        onSet(meta, newValue);
    };
};
var createRoot = function () {
    var listeners = new Set();
    var notify = function (value) { return listeners.forEach(function (listener) { return listener(value); }); };
    var subscribe = function (listener) {
        listeners.add(listener);
        return function () { return listeners.delete(listener); };
    };
    return { listeners: listeners, notify: notify, subscribe: subscribe };
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
        // if(isPromise(result)) result.then(value => store(value)) else
        store(result);
    };
    updateState();
};
// function isPromise(obj) {
//   return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
// }
var createSubscribe = function (effect) { return function (store, fn) {
    var prevValue = store();
    var cleanup;
    var runCleanup = function () {
        if (cleanup && typeof cleanup === 'function')
            cleanup();
        cleanup = undefined;
    };
    var listener = function () {
        runCleanup();
        var nextValue = store();
        if (nextValue !== prevValue)
            cleanup = fn(nextValue);
        prevValue = nextValue;
    };
    if (effect)
        fn(store());
    var unsub = store[META].root.subscribe(listener);
    return function () {
        runCleanup();
        unsub();
    };
}; };
var subscribe = createSubscribe(false);
var effect = createSubscribe(true);

exports.META = META;
exports.RECORD = RECORD;
exports.USEABLE = USEABLE;
exports.createRoot = createRoot;
exports.createSelector = createSelector;
exports.createTarget = createTarget;
exports.effect = effect;
exports.subscribe = subscribe;
