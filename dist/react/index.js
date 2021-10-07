'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var xoid = require('xoid');

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect;
var useConstant = function (fn) {
    var ref = react.useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
function useAtom(store, selector) {
    var forceUpdate = react.useReducer(function (c) { return c + 1; }, 0)[1];
    var item = react.useMemo(function () {
        return selector ? xoid.select(store, selector) : store;
    }, [store, selector]);
    useIsoLayoutEffect(function () { return xoid.subscribe(item, forceUpdate); }, []);
    return item();
}
function useSetup(model, props) {
    var setup = useConstant(function () {
        var deps = xoid.create(props);
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

exports.useAtom = useAtom;
exports.useSetup = useSetup;
