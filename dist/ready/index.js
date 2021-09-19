'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const META = Symbol();
const RECORD = Symbol();
const createTarget = (meta, onSet = (meta, value) => {
    meta.node = value;
    meta.root.notify();
}) => {
    return function (input) {
        if (arguments.length === 0)
            return meta.node;
        const newValue = typeof input === 'function' ? input(meta.node) : input;
        if (meta.node === newValue)
            return;
        onSet(meta, newValue);
    };
};
const createRoot = () => {
    const listeners = new Set();
    const notify = (value) => listeners.forEach((listener) => listener(value));
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    return { listeners, notify, subscribe };
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
        // if(isPromise(result)) result.then(value => store(value)) else
        store(result);
    };
    updateState();
};
// function isPromise(obj) {
//   return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
// }
const createSubscribe = (effect) => (store, fn) => {
    let prevValue = store();
    let cleanup;
    const runCleanup = () => {
        if (cleanup && typeof cleanup === 'function')
            cleanup();
        cleanup = undefined;
    };
    const listener = () => {
        runCleanup();
        const nextValue = store();
        if (nextValue !== prevValue)
            cleanup = fn(nextValue);
        prevValue = nextValue;
    };
    if (effect)
        fn(store());
    const unsub = store[META].root.subscribe(listener);
    return () => {
        runCleanup();
        unsub();
    };
};
const subscribe = createSubscribe(false);
const effect = createSubscribe(true);

const createCell = (pm, key) => {
    if (Object.prototype.hasOwnProperty.call(pm.cache, key))
        return pm.cache[key];
    const root = pm.root;
    const shape = pm.shape && (pm.shape[key] || pm.shape[RECORD]);
    const address = pm.address ? pm.address.map((s) => s) : [];
    address.push(key);
    const meta = {
        parentMeta: pm,
        root,
        key,
        address,
        get node() {
            return pm.node[key];
        },
        set node(value) {
            if (root.mutable) {
                pm.node[key] = value;
            }
            else {
                const copy = shallowClone(pm.node);
                copy[key] = value;
                pm.node = copy;
            }
        },
        cache: {},
        shape,
    };
    const target = createTarget(meta, root.onSet);
    const proxy = new Proxy(target, {
        get(_, prop) {
            if (prop === META)
                return meta;
            // start: prototype stuff
            const node = meta.node;
            if (prop === Symbol.toPrimitive)
                return () => node;
            if (!Object.prototype.hasOwnProperty.call(node, prop) &&
                Array.isArray(node) &&
                Object.prototype.hasOwnProperty.call(Array.prototype, prop)) {
                throw Error("Array prototype methods shouldn't be used with xoid stores");
            }
            // end: prototype stuff
            return createCell(meta, prop);
        },
        set() {
            return false;
        },
        has(_, key) {
            return key in meta.node;
        },
        ownKeys(t) {
            let keys = Reflect.ownKeys(meta.node);
            keys = keys.concat(Reflect.ownKeys(t));
            return Array.from(new Set(keys));
        },
        getOwnPropertyDescriptor(t, k) {
            if (Reflect.ownKeys(t).includes(k))
                return Reflect.getOwnPropertyDescriptor(t, k);
            return Reflect.getOwnPropertyDescriptor(meta.node, k);
        },
    });
    pm.cache[key] = proxy;
    return proxy;
};
const createInstance = (options = {}) => function (init, mutable) {
    const { shape, onSet } = options;
    const isFunction = typeof init === 'function';
    if (!arguments.length)
        mutable = true;
    const root = createRoot();
    Object.assign(root, { mutable, onSet });
    const store = createCell({
        node: { value: init },
        shape: { value: shape },
        cache: {},
        root,
    }, 'value');
    if (isFunction)
        createSelector(store, init);
    return store;
};
const shallowClone = (obj) => Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));

function ready(store) {
    const customTarget = (address = []) => {
        let sourceStore;
        let hasLastValue = false;
        let lastValue;
        const onSet = (_meta, value) => {
            if (sourceStore) {
                lastValue = undefined;
                hasLastValue = false;
                return sourceStore(value);
            }
            lastValue = value;
            hasLastValue = true;
        };
        // @ts-ignore
        const targetStore = createInstance({ onSet })(undefined, true);
        const meta = targetStore[META];
        const setTargetStore = (state) => {
            if (meta.node === state)
                return;
            meta.node = state;
            meta.root.notify();
        };
        effect(store, () => {
            const state = store();
            if (!state)
                return;
            sourceStore = address.reduce((acc, prop) => acc[prop], store);
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
        get: (target, prop) => {
            if (prop === META)
                return target[META];
            const newAddress = address.map(s => s);
            newAddress.push(prop);
            return addressProxy(fn, newAddress);
        },
    });
}

exports.ready = ready;
