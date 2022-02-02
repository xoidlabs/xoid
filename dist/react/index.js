'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var xoid = require('xoid');
var engine = require('@xoid/engine');

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect;
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
    /* eslint-disable react-hooks/rules-of-hooks*/
    var forceUpdate = react.useReducer(function (c) { return c + 1; }, 0)[1];
    if (!arguments.length) {
        var onCleanup = useCleanup();
        return engine.createGetState(forceUpdate, onCleanup);
    }
    var readable = react.useMemo(function () { return engine.createReadable(atom, selector); }, [atom, selector]);
    useIsoLayoutEffect(function () { return xoid.subscribe(readable, forceUpdate); }, [readable]);
    return readable();
    /* eslint-enable react-hooks/rules-of-hooks*/
}
function useSetup(setupFn, props) {
    var deps = useConstant(function () { return xoid.create(props); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return deps(props); }, [props]); // ?
    var onCleanup = useCleanup();
    return useConstant(function () { return setupFn(deps, onCleanup); });
}

exports.useAtom = useAtom;
exports.useSetup = useSetup;
