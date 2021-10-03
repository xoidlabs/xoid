'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var xoid = require('xoid');
var engine = require('@xoid/engine');

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect;
const useConstant = (fn) => {
    const ref = react.useRef();
    if (!ref.current)
        ref.current = { c: fn() };
    return ref.current.c;
};
function useAtom(store, selector) {
    const forceUpdate = react.useReducer((c) => c + 1, 0)[1];
    const item = react.useMemo(() => {
        return selector ? xoid.select(store, selector) : store;
    }, [store, selector]);
    useIsoLayoutEffect(() => engine.subscribe(item, forceUpdate), []);
    return item();
}
function useSetup(model, props) {
    const setup = useConstant(() => {
        const deps = xoid.create(props);
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

exports.useAtom = useAtom;
exports.useSetup = useSetup;
