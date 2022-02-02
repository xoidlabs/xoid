'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

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
            if (prop === engine.RECORD)
                return address;
            var newAddress = address.map(function (s) { return s; }); // avoid _spread polyfill
            newAddress.push(prop);
            return addressProxy(newAddress);
        },
    });
}
var select = function (atom, selector) {
    var _a = engine.parseSelector(selector), isPluck = _a.isPluck, fn = _a.fn;
    var address = (isPluck ? [selector] : fn(addressProxy([]))[engine.RECORD]);
    var target = engine.createTarget(function () { return fn(atom()); }, function (value) {
        var newState = setDeepValue(atom(), address, value);
        atom(newState);
    });
    target[engine.META] = atom[engine.META];
    return target;
};

function use(atom, fn) {
    if (arguments.length === 1)
        return atom[engine.USEABLE];
    return select(atom, fn);
}
function create(init, useable) {
    var meta = { notifier: engine.createNotifier(), node: init };
    var target = engine.createTarget(function () { return meta.node; }, function (value) {
        meta.node = value;
        meta.notifier.notify();
    });
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
