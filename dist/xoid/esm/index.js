import { USEABLE, createRoot, createTarget, createSelector, META, RECORD } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

/**
 * Gets the "useable"s of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
var use = function (atom) { return atom[USEABLE]; };
function create(init, useable) {
    var _a;
    var meta = { root: createRoot(), node: init };
    var target = createTarget(meta);
    if (typeof init === 'function')
        createSelector(target, init);
    Object.assign(target, (_a = {},
        _a[META] = meta,
        // @ts-ignore
        _a[USEABLE] = useable && typeof useable === 'function' ? useable(target) : undefined,
        _a));
    return target;
}

function lens(object, selector) {
    var isAtom = Boolean(object[META]);
    var atom = isAtom ? object : function () { return object; };
    return createLens(atom, selector, true);
}
function select(atom, selector) {
    var _a;
    var xoid = createLens(atom, selector);
    // @ts-ignore
    Object.assign(xoid, (_a = {}, _a[META] = atom[META], _a));
    return xoid;
}
var setDeepValue = function (obj, address, nextValue) {
    var a = address.map(function (s) { return s; }); // avoiding _spread polyfill
    var nextKey = a.shift();
    var nextState = shallowClone(obj);
    nextState[nextKey] = a.length
        ? setDeepValue(obj[nextKey], a, nextValue)
        : nextValue;
    return nextState;
};
var getDeepValue = function (obj, address) {
    var a = address.map(function (s) { return s; }); // avoiding _spread polyfill
    var next = a.shift();
    return a.length ? getDeepValue(obj[next], a) : obj[next];
};
function addressProxy(address) {
    return new Proxy({}, {
        get: function (_, prop) {
            if (prop === RECORD)
                return address;
            var newAddress = address.map(function (s) { return s; }); // avoiding _spread polyfill
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}
var createLens = function (atom, selector, isLens) {
    return function (input) {
        var isPluck = typeof selector === 'string';
        if (isPluck)
            selector = function (s) { return s[selector]; };
        if (arguments.length === 0)
            return selector(atom());
        var newValue = typeof input === 'function' ? input(selector(atom())) : input;
        if (selector(atom()) === newValue)
            return;
        var proxy = addressProxy([]);
        var address = (isPluck ? [selector] : selector(proxy)[RECORD]);
        if (isLens) {
            var addressWoLastKey = address.map(function (s) { return s; });
            var lastKey = addressWoLastKey.pop();
            getDeepValue(atom(), addressWoLastKey)[lastKey] = newValue;
            return;
        }
        var newState = setDeepValue(atom(), address, newValue);
        atom(newState);
    };
};
var shallowClone = function (obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

export { create, lens, select, use };
