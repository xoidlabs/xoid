'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var core = require('@xoid/core');

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
var useIsoLayoutEffect = typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect;
var useConstant = function (fn) {
    var ref = react.useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
function useStore(store) {
    var forceUpdate = react.useReducer(function (c) { return c + 1; }, 0)[1];
    useIsoLayoutEffect(function () { return core.subscribe(store, forceUpdate); }, []);
    return store();
}
function useSetup(model, props) {
    var setup = useConstant(function () {
        var deps = core.create(props, false);
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

exports.useSetup = useSetup;
exports.useStore = useStore;
