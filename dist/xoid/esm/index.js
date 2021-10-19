import { USABLE, createNotifier, createTarget, createSelector, META, RECORD } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

/**
 * Gets the "usable" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
var use = function (atom) { return atom[USABLE]; };
function create(init, usable) {
    var _a;
    var meta = { notifier: createNotifier(), node: init };
    var target = createTarget(meta);
    if (typeof init === 'function')
        createSelector(target, init);
    Object.assign(target, (_a = {},
        _a[META] = meta,
        // @ts-ignore
        _a[USABLE] = usable && typeof usable === 'function' ? usable(target) : undefined,
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
    if (a.length)
        nextValue = setDeepValue(obj[nextKey], a, nextValue);
    nextState[nextKey] = nextValue;
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
    var isPluck = typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol';
    var fn = isPluck ? function (s) { return s[selector]; } : selector;
    return function (input) {
        if (arguments.length === 0)
            return fn(atom());
        var newValue = typeof input === 'function' ? input(fn(atom())) : input;
        if (fn(atom()) === newValue)
            return;
        var address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]);
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
    return Array.isArray(obj)
        ? obj.map(function (s) { return s; })
        : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

export { create, lens, select, use };
