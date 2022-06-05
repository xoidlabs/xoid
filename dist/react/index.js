'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shim = require('use-sync-external-store/shim');
var react = require('react');
var xoid = require('xoid');
var engine = require('@xoid/engine');

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = window === undefined ? react.useEffect : react.useLayoutEffect;
var useConstant = function (fn) {
    var ref = react.useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
var useCleanup = function () {
    var _a = useConstant(engine.createCleanup), onCleanup = _a.onCleanup, cleanupAll = _a.cleanupAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return cleanupAll; }, []);
    return onCleanup;
};
function useAtom(atom, selector) {
    var readable = react.useMemo(function () { return engine.createReadable(atom, selector); }, [atom, selector]);
    var result = shim.useSyncExternalStore(readable[engine.META].notifier.subscribe, readable, readable);
    react.useDebugValue(result);
    return result;
}
function useSetup(setupFn, props) {
    var $deps = useConstant(function () { return xoid.create(function () { return props; }); });
    // Don't refactor line 51, because it needs to be strictly `() => props`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return $deps(function () { return props; }); }, [props]);
    var onCleanup = useCleanup();
    return useConstant(function () { return setupFn($deps, onCleanup); });
}

exports.useAtom = useAtom;
exports.useSetup = useSetup;
