'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

var createCell = function (pm, key) {
    if (Object.prototype.hasOwnProperty.call(pm.cache, key))
        return pm.cache[key];
    var root = pm.root;
    var shape = pm.shape && (pm.shape[key] || pm.shape[engine.RECORD]);
    var address = pm.address ? pm.address.map(function (s) { return s; }) : [];
    address.push(key);
    var meta = {
        parentMeta: pm,
        root: root,
        key: key,
        address: address,
        get node() {
            return pm.node[key];
        },
        set node(value) {
            if (root.mutable) {
                pm.node[key] = value;
            }
            else {
                var copy = shallowClone(pm.node);
                copy[key] = value;
                pm.node = copy;
            }
        },
        cache: {},
        shape: shape,
    };
    var target = engine.createTarget(meta, root.onSet);
    var proxy = new Proxy(target, {
        get: function (_, prop) {
            if (prop === engine.META)
                return meta;
            // start: prototype stuff
            var node = meta.node;
            if (prop === Symbol.toPrimitive)
                return function () { return node; };
            if (!Object.prototype.hasOwnProperty.call(node, prop) &&
                Array.isArray(node) &&
                Object.prototype.hasOwnProperty.call(Array.prototype, prop)) {
                throw Error("Array prototype methods shouldn't be used with xoid stores");
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
        ownKeys: function (t) {
            var keys = Reflect.ownKeys(meta.node);
            keys = keys.concat(Reflect.ownKeys(t));
            return Array.from(new Set(keys));
        },
        getOwnPropertyDescriptor: function (t, k) {
            if (Reflect.ownKeys(t).includes(k))
                return Reflect.getOwnPropertyDescriptor(t, k);
            return Reflect.getOwnPropertyDescriptor(meta.node, k);
        },
    });
    pm.cache[key] = proxy;
    return proxy;
};
var createInstance = function (options) {
    if (options === void 0) { options = {}; }
    return function (init, mutable) {
        var shape = options.shape, onSet = options.onSet;
        var isFunction = typeof init === 'function';
        if (!arguments.length)
            mutable = true;
        var root = engine.createRoot();
        Object.assign(root, { mutable: mutable, onSet: onSet });
        var store = createCell({
            node: { value: init },
            shape: { value: shape },
            cache: {},
            root: root,
        }, 'value');
        if (isFunction)
            engine.createSelector(store, init);
        return store;
    };
};
var shallowClone = function (obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

var USEABLE = Symbol('use');
var fromShape = function (shape) {
    return new Proxy(createInstance({ shape: shape }), {
        get: function (_, prop) {
            if (shape[prop])
                return shape[prop];
        },
    });
};
var memoizedUseables = new WeakMap();
function model(payload, useable) {
    var _a;
    var isFunction = typeof payload === 'function';
    var shape = (_a = {}, _a[USEABLE] = isFunction ? payload : useable, _a);
    if (!isFunction)
        Object.assign(shape, payload);
    return fromShape(shape);
}
function wrapped(store, o) {
    var dh = store[engine.META].root.devtoolsHelper;
    return dh ? dh(store, o, []) : o;
}
/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
// @ts-ignore
var use = function (store) {
    var _a;
    var attempt = memoizedUseables.get(store);
    if (attempt)
        return wrapped(store, attempt);
    var shape = (_a = store[engine.META]) === null || _a === void 0 ? void 0 : _a.shape;
    var useable = shape && shape[USEABLE];
    if (typeof useable === 'function') {
        var u = useable(store);
        memoizedUseables.set(store, u);
        return wrapped(store, u);
    }
};
/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */
var arrayOf = function (model, useable) {
    var _a;
    return fromShape((_a = {}, _a[USEABLE] = useable, _a[engine.RECORD] = model, _a));
};
/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */
var objectOf = function (model, useable) {
    var _a;
    return fromShape((_a = {}, _a[USEABLE] = useable, _a[engine.RECORD] = model, _a));
};

exports.arrayOf = arrayOf;
exports.model = model;
exports.objectOf = objectOf;
exports.use = use;
