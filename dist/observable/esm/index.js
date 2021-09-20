import { createRoot, createTarget, META, createSelector } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

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

export { observable };
