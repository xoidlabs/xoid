'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

/**
 * Gets the "usable" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
var use = function (atom) { return atom[engine.USABLE]; };
function create(init, usable) {
    var _a;
    var meta = { notifier: engine.createNotifier(), node: init };
    var target = engine.createTarget(meta);
    if (typeof init === 'function')
        engine.createSelector(target, init);
    Object.assign(target, (_a = {},
        _a[engine.META] = meta,
        // @ts-ignore
        _a[engine.USABLE] = usable && typeof usable === 'function' ? usable(target) : undefined,
        _a));
    return target;
}

function lens(object, selector) {
    var isAtom = Boolean(object[engine.META]);
    var atom = isAtom ? object : function () { return object; };
    return createLens(atom, selector, true);
}
function select(atom, selector) {
    var _a;
    var xoid = createLens(atom, selector);
    // @ts-ignore
    Object.assign(xoid, (_a = {}, _a[engine.META] = atom[engine.META], _a));
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
            if (prop === engine.RECORD)
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
        var address = (isPluck ? [selector] : fn(addressProxy([]))[engine.RECORD]);
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

Object.defineProperty(exports, 'effect', {
  enumerable: true,
  get: function () {
    return engine.effect;
  }
});
Object.defineProperty(exports, 'subscribe', {
  enumerable: true,
  get: function () {
    return engine.subscribe;
  }
});
exports.create = create;
exports.lens = lens;
exports.select = select;
exports.use = use;
