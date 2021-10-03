import { useReducer, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { select, create } from 'xoid';
import { subscribe } from '@xoid/engine';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const useConstant = (fn) => {
    const ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
function useAtom(store, selector) {
    const forceUpdate = useReducer((c) => c + 1, 0)[1];
    const item = useMemo(() => {
        return selector ? select(store, selector) : store;
    }, [store, selector]);
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

export { useAtom, useSetup };
