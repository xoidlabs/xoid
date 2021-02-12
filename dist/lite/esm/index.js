import { createRoot, createTarget, META, USEABLE, createSelector, subscribe } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';
import { useReducer, useEffect, useLayoutEffect, useRef } from 'react';

function create(init, useable) {
    const isFunction = typeof init === 'function';
    const meta = { root: createRoot(), node: init };
    const target = createTarget(meta);
    // @ts-ignore
    Object.assign(target, {
        [META]: meta,
        // @ts-ignore
        [USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
    });
    if (isFunction)
        createSelector(target, init);
    return target;
}
// @ts-ignore
const use = (store) => store[USEABLE];
const select = (store, fn) => {
    const xoid = function (input) {
        if (arguments.length === 0) {
            return fn(store());
        }
        const newValue = typeof input === 'function' ? input(fn(store())) : input;
        if (fn(store()) === newValue)
            return;
        surgicallySet(newValue, store, fn);
    };
    // @ts-ignore
    Object.assign(xoid, { [META]: store[META] });
    return xoid;
};
const ADDRESS = Symbol();
const surgicallySet = (newValue, store, fn) => {
    const proxy = addressProxy([]);
    const address = fn(proxy)[ADDRESS];
    const newState = setDeepValue(store(), address, newValue);
    store(newState);
};
const setDeepValue = (obj, address, newValue) => {
    const a = [...address];
    const next = a.shift();
    return Object.assign(Object.assign({}, obj), { [next]: a.length ? setDeepValue(obj[next], a, newValue) : newValue });
};
function addressProxy(address) {
    return new Proxy({}, {
        get: (_, prop) => {
            if (prop === ADDRESS)
                return address;
            const newAddress = address.map((s) => s);
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const useConstant = (fn) => {
    const ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
function useStore(store, selector) {
    const forceUpdate = useReducer((c) => c + 1, 0)[1];
    const item = useConstant(() => {
        return selector ? select(store, selector) : store;
    });
    useIsoLayoutEffect(() => subscribe(item, forceUpdate), []);
    return item();
}
function useSetup(model, props) {
    const setup = useConstant(() => {
        const deps = create(props);
        const fns = [];
        const onCleanup = (fn) => fns.push(fn);
        const main = model(deps, onCleanup);
        return { main, deps, fns };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(() => setup.deps(props), [props]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(() => () => setup.fns.forEach((fn) => fn()), []);
    return setup.main;
}

export { create, select, use, useSetup, useStore };
