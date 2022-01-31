import { RECORD, META, USEABLE, createNotifier, createTarget, createSelector } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

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
var createLens = function (atom, selector) {
    var isPluck = typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol';
    var fn = isPluck ? function (s) { return s[selector]; } : selector;
    return function (input) {
        if (arguments.length === 0)
            return fn(atom());
        var newValue = typeof input === 'function' ? input(fn(atom())) : input;
        if (fn(atom()) === newValue)
            return;
        var address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]);
        var newState = setDeepValue(atom(), address, newValue);
        atom(newState);
    };
};
var shallowClone = function (obj) {
    return Array.isArray(obj)
        ? obj.map(function (s) { return s; })
        : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};

function use(atom, fn) {
    if (arguments.length === 1)
        return atom[USEABLE];
    return select(atom, fn);
}
function create(init, useable) {
    var meta = { notifier: createNotifier(), node: init };
    var target = createTarget(meta);
    if (typeof init === 'function')
        createSelector(target, init);
    target[META] = meta;
    if (useable && typeof useable === 'function')
        target[USEABLE] = useable(target);
    return target;
}

export { create, use };
