import { createRoot, createSelector, RECORD, createTarget, META, subscribe as subscribe$1, effect as effect$1 } from '@xoid/engine';

var createCell = function (pm, key) {
    if (Object.prototype.hasOwnProperty.call(pm.cache, key))
        return pm.cache[key];
    var root = pm.root;
    var shape = pm.shape && (pm.shape[key] || pm.shape[RECORD]);
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
    var target = createTarget(meta, root.onSet);
    var proxy = new Proxy(target, {
        get: function (_, prop) {
            if (prop === META)
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
        var root = createRoot();
        Object.assign(root, { mutable: mutable, onSet: onSet });
        var store = createCell({
            node: { value: init },
            shape: { value: shape },
            cache: {},
            root: root,
        }, 'value');
        if (isFunction)
            createSelector(store, init);
        return store;
    };
};
var shallowClone = function (obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
var create = createInstance();
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
var subscribe = subscribe$1;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
var effect = effect$1;

export { create, effect, subscribe };
