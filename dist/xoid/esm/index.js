import { parseSelector, RECORD, createTarget, META, USEABLE, createNotifier, createSelector } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

var shallowClone = function (obj) {
    return Array.isArray(obj)
        ? obj.map(function (s) { return s; }) // avoid _spread polyfill
        : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};
var setDeepValue = function (obj, address, nextValue) {
    var a = address.map(function (s) { return s; }); // avoid _spread polyfill
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
            var newAddress = address.map(function (s) { return s; }); // avoid _spread polyfill
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}
var select = function (atom, selector) {
    var _a = parseSelector(selector), isPluck = _a.isPluck, fn = _a.fn;
    var address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]);
    var target = createTarget(function () { return fn(atom()); }, function (value) {
        var newState = setDeepValue(atom(), address, value);
        atom(newState);
    });
    target[META] = atom[META];
    return target;
};

function use(atom, fn) {
    if (arguments.length === 1)
        return atom[USEABLE];
    return select(atom, fn);
}
function create(init, useable) {
    var meta = { notifier: createNotifier(), node: init };
    var target = createTarget(function () { return meta.node; }, function (value) {
        meta.node = value;
        meta.notifier.notify();
    });
    if (typeof init === 'function')
        createSelector(target, init);
    target[META] = meta;
    if (useable && typeof useable === 'function')
        target[USEABLE] = useable(target);
    return target;
}

export { create, use };
