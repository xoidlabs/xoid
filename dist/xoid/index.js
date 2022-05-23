'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

var clone = function (obj) {
    return Array.isArray(obj)
        ? obj.map(function (s) { return s; }) // avoid _spread polyfill
        : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
};
function set(obj, path, value) {
    if (!path.length)
        return value;
    var rest = path.map(function (a) { return a; });
    var key = rest.shift();
    var ans = clone(obj);
    ans[key] = set(obj[key], rest, value);
    return ans;
}
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
    var address;
    var target = engine.createTarget(function () { return fn(atom()); }, function (value) {
        return atom(function (state) {
            if (!address)
                address = (isPluck ? [selector] : fn(addressProxy([]))[engine.RECORD]);
            return set(state, address, value);
        });
    });
    target[engine.META] = atom[engine.META];
    return target;
};

function use(atom, fn) {
    if (arguments.length === 1) {
        var u = atom[engine.USABLE];
        var dh = atom[engine.META].devtoolsHelper;
        return dh ? dh(atom, u) : u;
    }
    return select(atom, fn);
}
function create(init, usable, enhancer) {
    var meta = { notifier: engine.createNotifier(), node: init };
    var setter = function (value) {
        meta.node = value;
        meta.notifier.notify();
    };
    var target = engine.createTarget(function () { return meta.node; }, enhancer ? enhancer(setter) : setter);
    target[engine.META] = meta;
    if (typeof init === 'function')
        engine.createSelector(target, init);
    if (usable && typeof usable === 'function')
        target[engine.USABLE] = usable(target);
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
