import { parseSelector, createTarget, RECORD, META, USABLE, createNotifier, createSelector } from '@xoid/engine';
export { effect, subscribe } from '@xoid/engine';

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
    var address;
    var target = createTarget(function () { return fn(atom()); }, function (value) {
        return atom(function (state) {
            if (!address)
                address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]);
            return set(state, address, value);
        });
    });
    target[META] = atom[META];
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
    var setter = function (value) {
        meta.node = value;
        meta.notifier.notify();
    };
    var target = createTarget(function () { return meta.node; }, enhancer ? enhancer(setter) : setter);
    target[META] = meta;
    if (typeof init === 'function')
        createSelector(target, init);
    if (usable && typeof usable === 'function')
        target[USABLE] = usable(target);
    return target;
}

export { create, use };
