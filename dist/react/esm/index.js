import { useReducer, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { subscribe, create } from 'xoid';
import { createGetState, createReadable, createCleanup } from '@xoid/engine';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
var useConstant = function (fn) {
    var ref = useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
var useCleanup = function () {
    var _a = useConstant(createCleanup), onCleanup = _a.onCleanup, cleanupAll = _a.cleanupAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return cleanupAll; }, []);
    return onCleanup;
};
function useAtom(atom, selector) {
    /* eslint-disable react-hooks/rules-of-hooks*/
    var forceUpdate = useReducer(function (c) { return c + 1; }, 0)[1];
    if (!arguments.length) {
        var onCleanup = useCleanup();
        return createGetState(forceUpdate, onCleanup);
    }
    var readable = useMemo(function () { return createReadable(atom, selector); }, [atom, selector]);
    useIsoLayoutEffect(function () { return subscribe(readable, forceUpdate); }, [readable]);
    return readable();
    /* eslint-enable react-hooks/rules-of-hooks*/
}
function useSetup(setupFn, props) {
    var deps = useConstant(function () { return create(props); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return deps(props); }, [props]); // ?
    var onCleanup = useCleanup();
    return useConstant(function () { return setupFn(deps, onCleanup); });
}

export { useAtom, useSetup };
