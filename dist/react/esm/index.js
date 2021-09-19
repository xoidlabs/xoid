import { useReducer, useEffect, useLayoutEffect, useRef } from 'react';
import { subscribe, create } from '@xoid/core';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
var useConstant = function (fn) {
    var ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
function useStore(store) {
    var forceUpdate = useReducer(function (c) { return c + 1; }, 0)[1];
    useIsoLayoutEffect(function () { return subscribe(store, forceUpdate); }, []);
    return store();
}
function useSetup(model, props) {
    var setup = useConstant(function () {
        var deps = create(props, false);
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

export { useSetup, useStore };
