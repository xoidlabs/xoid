'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var snapshot = function (store) { return store(); };
/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
var devtools = function (atom, name) {
    // borrowed heavily from https://github.com/pmndrs/valtio/blob/main/src/utils/devtools.ts
    var extension;
    try {
        extension = window.__REDUX_DEVTOOLS_EXTENSION__;
    }
    catch (_a) { }
    if (!extension) {
        if (typeof process === 'object' &&
            process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined') {
            console.warn('[Warning] Please install/enable Redux devtools extension');
        }
        return function () { return void 0; };
    }
    var dt = extension.connect({ name: name });
    atom[engine.META].devtoolsHelper = createDevtoolsHelper();
    var channel = (atom[engine.META].devtoolsChannel = engine.createNotifier());
    var currentAction;
    // @ts-ignore
    var unsub0 = channel.subscribe(function (state) {
        if (!state && currentAction) {
            dt.send(currentAction, snapshot(atom));
        }
        currentAction = state;
        if (state && state.async) {
            var modifier = state.end ? ' (end)' : '';
            dt.send(__assign(__assign({}, state), { type: state.type + modifier }), snapshot(atom));
            currentAction = undefined;
        }
    });
    var isTimeTraveling = false;
    var unsub1 = engine.subscribe(atom, function () {
        if (isTimeTraveling) {
            isTimeTraveling = false;
        }
        else {
            var now = window.performance.now().toFixed(2);
            var action = currentAction && !currentAction.async ? currentAction : "Update (" + now + ")";
            dt.send(action, snapshot(atom));
            currentAction = undefined;
        }
    });
    var unsub2 = dt.subscribe(function (message) {
        var _a, _b, _c, _d, _e, _f;
        if (message.type !== 'DISPATCH')
            return;
        if (message.state) {
            if (((_a = message.payload) === null || _a === void 0 ? void 0 : _a.type) === 'JUMP_TO_ACTION' || ((_b = message.payload) === null || _b === void 0 ? void 0 : _b.type) === 'JUMP_TO_STATE') {
                isTimeTraveling = true;
            }
            var nextValue = JSON.parse(message.state);
            atom(nextValue);
        }
        else if (((_c = message.payload) === null || _c === void 0 ? void 0 : _c.type) === 'COMMIT') {
            dt.init(snapshot(atom));
        }
        else if (((_d = message.payload) === null || _d === void 0 ? void 0 : _d.type) === 'IMPORT_STATE') {
            var actions_1 = (_e = message.payload.nextLiftedState) === null || _e === void 0 ? void 0 : _e.actionsById;
            var computedStates = ((_f = message.payload.nextLiftedState) === null || _f === void 0 ? void 0 : _f.computedStates) || [];
            isTimeTraveling = true;
            computedStates.forEach(function (_a, index) {
                var state = _a.state;
                var action = actions_1[index] || "Update - " + new Date().toLocaleString();
                atom(state);
                if (index === 0)
                    dt.init(snapshot(atom));
                else
                    dt.send(action, snapshot(atom));
            });
        }
    });
    dt.init(snapshot(atom));
    return function () {
        unsub0();
        unsub1();
        unsub2();
    };
};
function isEligible(o) {
    return (o === Object(o) &&
        ['[object Object]', '[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(o)));
}
var createDevtoolsHelper = function () {
    var getAddress = function (store, obj, actionAddress) {
        if (actionAddress === void 0) { actionAddress = []; }
        if (!isEligible(obj))
            return obj;
        return new Proxy(obj, {
            get: function (target, prop) {
                if (prop === engine.META)
                    return target[engine.META];
                if (!isEligible(target[prop]))
                    return target[prop];
                var newActionAddress = actionAddress.map(function (i) { return i; });
                newActionAddress.push(prop);
                return getAddress(store, obj[prop], newActionAddress);
            },
            apply: function (target, thisArg, args) {
                var _a, _b;
                if (target[engine.META] || !store[engine.META].devtoolsChannel)
                    return Reflect.apply(target, thisArg, args);
                var storeAddress = (_b = (_a = store[engine.META]) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.slice(1).map(shorten);
                var begin = (storeAddress === null || storeAddress === void 0 ? void 0 : storeAddress.length) ? "(*." + storeAddress.join('.') + ")" : '*';
                var isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]';
                var action = {
                    type: begin + "." + actionAddress.map(nodot).join('.'),
                };
                if (isAsync) {
                    // @ts-ignore
                    action.async = true;
                    var attemptTimes = calledTimesMap.get(target);
                    if (!attemptTimes) {
                        attemptTimes = { i: 0 };
                        calledTimesMap.set(target, attemptTimes);
                    }
                    attemptTimes.i++;
                    action.type = action.type + ' #' + attemptTimes.i;
                }
                store[engine.META].devtoolsChannel.notify(__assign(__assign({}, action), { args: args }));
                var result = Reflect.apply(target, thisArg, args);
                if (isAsync)
                    result.then(function () { return store[engine.META].devtoolsChannel.notify(__assign(__assign({}, action), { end: true })); });
                else
                    store[engine.META].devtoolsChannel.notify(undefined);
                return result;
            },
        });
    };
    return getAddress;
};
var shorten = function (s) {
    return s.length < 10 ? nodot(s) : nodot(s.slice(0, 3)) + '..' + nodot(s.slice(-3));
};
var nodot = function (s) {
    return s.replace('.', '\\.');
};
var calledTimesMap = new WeakMap();

exports.devtools = devtools;
