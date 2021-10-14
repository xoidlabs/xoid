import { useReducer, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { subscribe as subscribe$1, create } from 'xoid';

var META = Symbol();
var createCleanup = function () {
    var unsubs = new Set();
    var onCleanup = function (fn) { return void unsubs.add(fn); };
    var cleanupAll = function () {
        unsubs.forEach(function (fn) { return fn(); });
        unsubs.clear();
    };
    return { onCleanup: onCleanup, cleanupAll: cleanupAll };
};
var parseSelector = function (selector) {
    var isPluck = typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol';
    return isPluck ? function (s) { return s[selector]; } : selector;
};
function createReadable(atom, selector) {
    var _a;
    if (!selector)
        return atom;
    var fn = parseSelector(selector);
    return Object.assign((function () { return fn(atom()); }), (_a = {}, _a[META] = atom[META], _a));
}
var createGetState = function (updateState, onCleanup) {
    // @ts-ignore
    return function (atom, selector) {
        var readable = createReadable(atom, selector);
        onCleanup(subscribe(readable, updateState));
        return readable();
    };
};
var createSubscribe = function (effect) {
    return function (atom, fn) {
        // cleanup + runCleanup
        var cleanup;
        var runCleanup = function () {
            if (cleanup && typeof cleanup === 'function')
                cleanup();
            cleanup = undefined;
        };
        // Listener
        var prevValue = atom();
        var listener = function () {
            var nextValue = atom();
            if (nextValue !== prevValue) {
                runCleanup();
                cleanup = fn(nextValue, prevValue);
                prevValue = nextValue;
            }
        };
        // If it's an effect, also collect the cleanup value at the first run
        if (effect)
            cleanup = fn(prevValue, prevValue);
        // Actually subscribe internally
        var unsub = atom[META].notifier.subscribe(listener);
        // Return unsub
        return function () {
            runCleanup();
            unsub();
        };
    };
};
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
var subscribe = createSubscribe(false);

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
    useIsoLayoutEffect(function () { return subscribe$1(readable, forceUpdate); }, []);
    return readable();
    /* eslint-enable react-hooks/rules-of-hooks*/
}
function useSetup(model, props) {
    var deps = useConstant(function () { return create(props); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useIsoLayoutEffect(function () { return deps(props); }, [props]);
    var onCleanup = useCleanup();
    return useConstant(function () { return model(deps, onCleanup); });
}

export { useAtom, useSetup };
