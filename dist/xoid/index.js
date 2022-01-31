'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

function select(atom, selector) {
    var xoid = createLens(atom, selector);
    xoid[engine.META] = atom[engine.META];
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
            if (prop === engine.RECORD)
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
        var address = (isPluck ? [selector] : fn(addressProxy([]))[engine.RECORD]);
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
        return atom[engine.USEABLE];
    return select(atom, fn);
}
function create(init, useable) {
    var meta = { notifier: engine.createNotifier(), node: init };
    var target = engine.createTarget(meta);
    if (typeof init === 'function')
        engine.createSelector(target, init);
    target[engine.META] = meta;
    if (useable && typeof useable === 'function')
        target[engine.USEABLE] = useable(target);
    return target;
}

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
exports.use = use;
