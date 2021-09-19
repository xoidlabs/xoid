const META = Symbol();
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

const observable = (init) => {
    const isFunction = typeof init === 'function';
    const meta = { root: createRoot(), node: init };
    const target = createTarget(meta);
    //@ts-ignore
    const obj = Object.assign(target, { [META]: meta });
    if (isFunction)
        createSelector(obj, init);
    return obj;
};

export { effect, observable, subscribe };
