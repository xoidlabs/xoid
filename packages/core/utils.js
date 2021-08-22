'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//@ts-ignore
var RECORD = window.__XOID_SYMBOLS__ ? window.__XOID_SYMBOLS__.record : Symbol();
//@ts-ignore
var META = window.__XOID_SYMBOLS__ ? window.__XOID_SYMBOLS__.meta : Symbol();
//@ts-ignore
if (!window.__XOID_SYMBOLS__)
    window.__XOID_SYMBOLS__ = { record: RECORD, meta: META };
var createCell = function (parentMeta, key) {
    var node = parentMeta.node[key];
    if (node && node[META])
        return node;
    if (parentMeta.cache[key])
        return parentMeta.cache[key];
    var meta = {
        parentMeta: parentMeta,
        key: key,
        get node() {
            return parentMeta.node[key];
        },
        set node(value) {
            if (meta.root.mutable) {
                parentMeta.node[key] = value;
                return;
            }
            var copy = generateNew(parentMeta.node);
            copy[key] = value;
            parentMeta.node = copy;
        },
        cache: {},
        root: parentMeta.root,
        shape: parentMeta.shape && (parentMeta.shape[RECORD] || parentMeta.shape[key]),
    };
    var proxy = new Proxy(createTarget(meta), {
        get: function (_, prop) {
            if (prop === META)
                return meta;
            // start: prototype stuff
            var node = meta.node;
            if (prop === Symbol.toPrimitive)
                return function () { return node; };
            if (!Object.prototype.hasOwnProperty.call(node, prop)) {
                if (node[prop]) {
                    return node[prop].bind
                        ? node[prop].bind(createCell(meta.parentMeta, meta.key))
                        : node[prop];
                }
            }
            // end: prototype stuff
            return createCell(meta, prop);
        },
        set: function () {
            return false;
        },
        has: function (_, key) {
            return key in meta.node;
        },
        ownKeys: function () {
            return Reflect.ownKeys(meta.node);
        },
        getOwnPropertyDescriptor: function () {
            return {
                enumerable: true,
                configurable: true,
            };
        },
    });
    parentMeta.cache[key] = proxy;
    return proxy;
};
var generateNew = function (obj) { return Object.assign(Array.isArray(obj) ? [] : Object.create(obj), obj); };
var createTarget = function (meta) {
    return function (input) {
        if (arguments.length === 0)
            return meta.node;
        var newValue = typeof input === 'function' ? input(meta.node) : input;
        if (meta.node === newValue)
            return;
        meta.node = newValue;
        meta.root.notify();
    };
};
var createRoot = function (mutable) {
    var listeners = new Set();
    var notify = function () { return listeners.forEach(function (listener) { return listener(); }); };
    var subscribe = function (listener) {
        listeners.add(listener);
        return function () { return listeners.delete(listener); };
    };
    return { listeners: listeners, notify: notify, subscribe: subscribe, mutable: mutable };
};
var createInstance = function (shape) { return function (init, mutable) {
    var isFunction = typeof init === 'function';
    var root = createRoot(mutable);
    var store = createCell({
        node: { value: isFunction ? null : init },
        cache: {},
        root: root,
        shape: { value: shape },
    }, 'value');
    if (isFunction) {
        var unsubs_1 = new Set();
        var getter_1 = function (store) {
            unsubs_1.add(subscribe(store, updateState_1));
            return store();
        };
        var updateState_1 = function () {
            unsubs_1.forEach(function (fn) { return fn(); });
            unsubs_1.clear();
            return store(init(getter_1));
        };
        updateState_1();
    }
    return store;
}; };
/**
 * Subscribes to a store, or a partial store.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
var subscribe = function (store, fn) {
    var prevValue = store();
    return store[META].root.subscribe(function () {
        var nextValue = store();
        if (nextValue !== prevValue)
            fn(nextValue);
        prevValue = nextValue;
    });
};

exports.META = META;
exports.RECORD = RECORD;
exports.createCell = createCell;
exports.createInstance = createInstance;
exports.createRoot = createRoot;
exports.createTarget = createTarget;
exports.subscribe = subscribe;
