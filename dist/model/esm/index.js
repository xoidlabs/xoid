import { createRoot, createSelector, RECORD, createTarget, META } from '@xoid/engine';

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

const USEABLE = Symbol('use');
const fromShape = (shape) => new Proxy(createInstance({ shape }), {
    get(_, prop) {
        if (shape[prop])
            return shape[prop];
    },
});
const memoizedUseables = new WeakMap();
function model(payload, useable) {
    const isFunction = typeof payload === 'function';
    const shape = { [USEABLE]: isFunction ? payload : useable };
    if (!isFunction)
        Object.assign(shape, payload);
    return fromShape(shape);
}
function wrapped(store, o) {
    const dh = store[META].root.devtoolsHelper;
    return dh ? dh(store, o, []) : o;
}
/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
// @ts-ignore
const use = (store) => {
    var _a;
    const attempt = memoizedUseables.get(store);
    if (attempt)
        return wrapped(store, attempt);
    const shape = (_a = store[META]) === null || _a === void 0 ? void 0 : _a.shape;
    const useable = shape && shape[USEABLE];
    if (typeof useable === 'function') {
        const u = useable(store);
        memoizedUseables.set(store, u);
        return wrapped(store, u);
    }
};
/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */
const arrayOf = (model, useable) => fromShape({ [USEABLE]: useable, [RECORD]: model });
/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */
const objectOf = (model, useable) => fromShape({ [USEABLE]: useable, [RECORD]: model });

export { arrayOf, model, objectOf, use };
