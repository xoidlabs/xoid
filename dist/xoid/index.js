'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

const use = (store) => store[engine.USEABLE];
function create(init, useable) {
    const meta = { root: engine.createRoot(), node: init };
    const target = engine.createTarget(meta);
    Object.assign(target, {
        [engine.META]: meta,
        // @ts-ignore
        [engine.USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
    });
    if (typeof init === 'function')
        engine.createSelector(target, init);
    return target;
}

function select(store, selector) {
    const xoid = function (input) {
        const isPluck = typeof selector === 'string';
        if (isPluck)
            selector = (s) => s[selector];
        if (arguments.length === 0)
            return selector(store());
        const newValue = typeof input === 'function' ? input(selector(store())) : input;
        if (selector(store()) === newValue)
            return;
        const proxy = addressProxy([]);
        const address = isPluck ? [selector] : selector(proxy)[engine.RECORD];
        const newState = setDeepValue(store(), address, newValue);
        store(newState);
    };
    // @ts-ignore
    Object.assign(xoid, { [engine.META]: store[engine.META] });
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
const shallowClone = (obj) => {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

Object.defineProperty(exports, 'effect', {
  enumerable: true,
  get: function () {
    return engine.effect;
  }
});
Object.defineProperty(exports, 'subscribe', {
  enumerable: true,
  get: function () {
    return engine.subscribe;
  }
});
exports.create = create;
exports.select = select;
exports.use = use;
