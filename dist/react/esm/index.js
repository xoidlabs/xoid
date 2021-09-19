import { useReducer, useEffect, useLayoutEffect, useRef } from 'react';
import { subscribe, create } from '@xoid/core';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const useConstant = (fn) => {
    const ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
function useStore(store) {
    const forceUpdate = useReducer((c) => c + 1, 0)[1];
    useIsoLayoutEffect(() => subscribe(store, forceUpdate), []);
    return store();
}
function useSetup(model, props) {
    const setup = useConstant(() => {
        const deps = create(props, false);
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

export { useSetup, useStore };
