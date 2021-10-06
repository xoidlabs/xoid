import { createRoot, createSelector, RECORD, createTarget, META, subscribe as subscribe$1, effect as effect$1 } from '@xoid/engine';

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

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
const create = createInstance();
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
const subscribe = subscribe$1;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
const effect = effect$1;

export { create, effect, subscribe };
