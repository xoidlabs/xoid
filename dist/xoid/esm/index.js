import { USEABLE, createRoot, createTarget, createSelector, META, RECORD } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

/**
 * Gets the "useable"s of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
const use = (atom) => atom[USEABLE];
function create(init, useable) {
    const meta = { root: createRoot(), node: init };
    const target = createTarget(meta);
    if (typeof init === 'function')
        createSelector(target, init);
    Object.assign(target, {
        [META]: meta,
        // @ts-ignore
        [USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
    });
    return target;
}

function lens(object, selector) {
    const isAtom = Boolean(object[META]);
    const atom = isAtom ? object : () => object;
    return createLens(atom, selector, true);
}
function select(atom, selector) {
    const xoid = createLens(atom, selector);
    // @ts-ignore
    Object.assign(xoid, { [META]: atom[META] });
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
            if (prop === RECORD)
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
        const address = (isPluck ? [selector] : selector(proxy)[RECORD]);
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

export { create, lens, select, use };
