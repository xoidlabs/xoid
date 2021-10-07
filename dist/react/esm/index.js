import { useReducer, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { select, subscribe, create } from 'xoid';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
var useConstant = function (fn) {
    var ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
function useAtom(store, selector) {
    var forceUpdate = useReducer(function (c) { return c + 1; }, 0)[1];
    var item = useMemo(function () {
        return selector ? select(store, selector) : store;
    }, [store, selector]);
    useIsoLayoutEffect(function () { return subscribe(item, forceUpdate); }, []);
    return item();
}
function useSetup(model, props) {
    var setup = useConstant(function () {
        var deps = create(props);
        var fns = [];
        var onCleanup = function (fn) { return fns.push(fn); };
        var main = model(deps, onCleanup);
        return { main: main, deps: deps, fns: fns };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return setup.deps(props); }, [props]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return function () { return setup.fns.forEach(function (fn) { return fn(); }); }; }, []);
    return setup.main;
}

export { useAtom, useSetup };
