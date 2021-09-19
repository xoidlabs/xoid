import { createInstance } from '@xoid/core/utils';

const META = Symbol();
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
const effect = createSubscribe(true);

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

export { ready };
