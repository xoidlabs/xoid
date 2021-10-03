import { USEABLE, createRoot, createTarget, META, createSelector, RECORD } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

const use = (store) => store[USEABLE];
function create(init, useable) {
    const meta = { root: createRoot(), node: init };
    const target = createTarget(meta);
    Object.assign(target, {
        [META]: meta,
        // @ts-ignore
        [USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
    });
    if (typeof init === 'function')
        createSelector(target, init);
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
        const address = isPluck ? [selector] : selector(proxy)[RECORD];
        const newState = setDeepValue(store(), address, newValue);
        store(newState);
    };
    // @ts-ignore
    Object.assign(xoid, { [META]: store[META] });
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
            if (prop === RECORD)
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

export { create, select, use };
