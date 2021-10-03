'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

/**
 * Gets the "useable"s of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
const use = (atom) => atom[engine.USEABLE];
function create(init, useable) {
    const meta = { root: engine.createRoot(), node: init };
    const target = engine.createTarget(meta);
    if (typeof init === 'function')
        engine.createSelector(target, init);
    Object.assign(target, {
        [engine.META]: meta,
        // @ts-ignore
        [engine.USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
    });
    return target;
}

function select(atom, selector) {
    const xoid = createLens(atom, selector);
    // @ts-ignore
    Object.assign(xoid, { [engine.META]: atom[engine.META] });
    return xoid;
}
const setDeepValue = (obj, address, nextValue) => {
    const a = address.map((s) => s); // avoiding _spread polyfill
    const nextKey = a.shift();
    const nextState = shallowClone(obj);
    nextState[nextKey] = a.length
        ? setDeepValue(obj[nextKey], a, nextValue)
        : nextValue;
    return nextState;
};
const getDeepValue = (obj, address) => {
    const a = [...address];
    const next = a.shift();
    return a.length ? getDeepValue(obj[next], a) : obj[next];
};
function addressProxy(address) {
    return new Proxy({}, {
        get: (_, prop) => {
            if (prop === engine.RECORD)
                return address;
            const newAddress = address.map((s) => s); // avoiding _spread polyfill
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}
const createLens = (atom, selector, isLens) => {
    return function (input) {
        const isPluck = typeof selector === 'string';
        if (isPluck)
            selector = (s) => s[selector];
        if (arguments.length === 0)
            return selector(atom());
        const newValue = typeof input === 'function' ? input(selector(atom())) : input;
        if (selector(atom()) === newValue)
            return;
        const proxy = addressProxy([]);
        const address = (isPluck ? [selector] : selector(proxy)[engine.RECORD]);
        if (isLens) {
            const addressWoLastKey = address.map((s) => s);
            const lastKey = addressWoLastKey.pop();
            getDeepValue(atom(), addressWoLastKey)[lastKey] = newValue;
            return;
        }
        const newState = setDeepValue(atom(), address, newValue);
        atom(newState);
    };
};
const shallowClone = (obj) => {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
const subscribe = engine.subscribe;
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
const effect = engine.effect;

exports.create = create;
exports.effect = effect;
exports.select = select;
exports.subscribe = subscribe;
exports.use = use;
