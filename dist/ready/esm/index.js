var META = Symbol();
var RECORD = Symbol();
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

function ready(store) {
    var customTarget = function (address) {
        if (address === void 0) { address = []; }
        var sourceStore;
        var hasLastValue = false;
        var lastValue;
        var onSet = function (_meta, value) {
            if (sourceStore) {
                lastValue = undefined;
                hasLastValue = false;
                return sourceStore(value);
            }
            lastValue = value;
            hasLastValue = true;
        };
        // @ts-ignore
        var targetStore = createInstance({ onSet: onSet })(undefined, true);
        var meta = targetStore[META];
        var setTargetStore = function (state) {
            if (meta.node === state)
                return;
            meta.node = state;
            meta.root.notify();
        };
        effect(store, function () {
            var state = store();
            if (!state)
                return;
            sourceStore = address.reduce(function (acc, prop) { return acc[prop]; }, store);
            // if it suddenly appears, and it has a last value to set
            if (hasLastValue)
                return onSet(meta, lastValue);
            if (targetStore)
                setTargetStore(sourceStore());
        });
        return targetStore;
    };
    return addressProxy(customTarget, []);
}
function addressProxy(fn, address) {
    return new Proxy(fn(address), {
        get: function (target, prop) {
            if (prop === META)
                return target[META];
            var newAddress = address.map(function (s) { return s; });
            newAddress.push(prop);
            return addressProxy(fn, newAddress);
        },
    });
}

export { ready };
