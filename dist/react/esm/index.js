import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useMemo, useDebugValue, useEffect, useLayoutEffect, useRef } from 'react';
import { create } from 'xoid';
import { createReadable, META, createCleanup } from '@xoid/engine';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect;
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
    var readable = useMemo(function () { return createReadable(atom, selector); }, [atom, selector]);
    var result = useSyncExternalStore(readable[META].notifier.subscribe, readable, readable);
    useDebugValue(result);
    return result;
}
function useSetup(setupFn, props) {
    var $deps = useConstant(function () { return create(function () { return props; }); });
    // Don't refactor line 51, because it needs to be strictly `() => props`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return $deps(function () { return props; }); }, [props]);
    var onCleanup = useCleanup();
    return useConstant(function () { return setupFn($deps, onCleanup); });
}

export { useAtom, useSetup };
