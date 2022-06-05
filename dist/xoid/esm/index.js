import { parseSelector, RECORD, META, createTarget, USABLE, createNotifier, createCleanup, createGetState } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

var createSetValue = function (getValue, meta, enhancer) {
    var setValue = function (value) {
        meta.node = value;
        meta.notifier.notify();
    };
    if (enhancer)
        setValue = enhancer(setValue);
    return function (x) {
        var nextValue = typeof x === 'function' ? x(getValue()) : x;
        setValue(nextValue);
    };
};
var clone = function (obj) {
    return Array.isArray(obj)
        ? obj.map(function (s) { return s; }) // avoid _spread polyfill
        : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};
function setIn(obj, path, value) {
    if (!path.length)
        return value;
    var rest = path.map(function (a) { return a; });
    var key = rest.shift();
    var ans = clone(obj);
    ans[key] = setIn(obj[key], rest, value);
    return ans;
}
function addressProxy(address) {
    return new Proxy({}, {
        get: function (_, prop) {
            if (prop === RECORD)
                return address;
            var newAddress = address.map(function (s) { return s; }); // avoid _spread polyfill
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}
var select = function (atom, selector) {
    var _a = parseSelector(selector), isPluck = _a.isPluck, fn = _a.fn;
    var relativePath = isPluck ? [selector] : fn(addressProxy([]))[RECORD];
    var meta = atom[META];
    var path = (atom[RECORD] || []).concat(relativePath);
    var hasSymbol = relativePath.some(function (item) { return typeof item === 'symbol'; });
    if (!hasSymbol) {
        var pathKey = JSON.stringify(path);
        // if the path has no symbols, attempt to retrieve already memoized atom
        if (!meta.selectors)
            meta.selectors = {};
        if (meta.selectors[pathKey]) {
            return meta.selectors[pathKey];
        }
    }
    // Paths that contain ES6 Symbols are permitted, however they will
    // not be memoized as they serialize to "null", to avoid clashes.
    var getValue = function () { return fn(atom()); };
    var setValue = createSetValue(getValue, meta, 
    // Following line should call `meta.node`, not `getValue()`
    // Because `getValue` might give the value of a derived atom.
    function (setter) { return function (value) {
        // internally call the source atom, in case if it's a lazily evaluated one
        atom();
        setter(setIn(meta.node, path, value));
    }; });
    var target = createTarget(getValue, setValue);
    target[META] = meta;
    target[RECORD] = path;
    if (!hasSymbol) {
        // if the path has no symbols, memoize
        var pathKey = JSON.stringify(path);
        meta.selectors[pathKey] = target;
    }
    return target;
};

function use(atom, fn) {
    if (arguments.length === 1) {
        var u = atom[USABLE];
        var dh = atom[META].devtoolsHelper;
        return dh ? dh(atom, u) : u;
    }
    return select(atom, fn);
}
function create(init, usable, enhancer) {
    var meta = { notifier: createNotifier(), node: init };
    var isValid = true;
    var evaluate; // only populated when it's a selector
    var getValue = function () {
        if (!isValid)
            evaluate();
        return meta.node;
    };
    var setValue = createSetValue(getValue, meta, enhancer);
    var target = createTarget(getValue, setValue);
    target[META] = meta;
    // If the state initializer is a function, use lazily evaluate that function when the
    // state is being read.
    if (typeof init === 'function') {
        // Start with invalid (not-yet-evaluated) state
        isValid = false;
        var _a = createCleanup(), onCleanup = _a.onCleanup, cleanupAll_1 = _a.cleanupAll;
        var getter_1 = createGetState(function () {
            // This is where an invalidation signal dispatches. If there are listeners,
            // invalidations cause re-evaluation without setting `isValid` to `false`.
            if (meta.notifier.listeners.size)
                evaluate();
            // If there are no listeners on the other hand, they set `isValid` to `false`.
            // This way, if a subscriber is attached the next time, or the state value is read,
            // `createTarget` will call `evaluate`.
            else
                isValid = false;
        }, onCleanup);
        evaluate = function () {
            cleanupAll_1();
            var result = init(getter_1);
            meta.node = result;
            isValid = true;
            if (target() === result)
                return;
            meta.notifier.notify();
        };
    }
    if (usable && typeof usable === 'function')
        target[USABLE] = usable(target);
    return target;
}

export { create, use };
