'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

const snapshot = (store) => store();
/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
const devtools = (store, name) => {
    // borrowed heavily from https://github.com/pmndrs/valtio/blob/main/src/utils/devtools.ts
    let extension;
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
        return () => void 0;
    }
    const dt = extension.connect({ name });
    store[engine.META].root.devtoolsHelper = createDevtoolsHelper();
    const channel = (store[engine.META].root.devtoolsChannel = engine.createRoot());
    let currentAction;
    //@ts-ignore
    const unsub0 = channel.subscribe((state) => {
        if (!state && currentAction) {
            dt.send(currentAction, snapshot(store));
        }
        currentAction = state;
        if (state && state.async) {
            const modifier = state.end ? ' (end)' : '';
            dt.send(Object.assign(Object.assign({}, state), { type: state.type + modifier }), snapshot(store));
            currentAction = undefined;
        }
    });
    let isTimeTraveling = false;
    const unsub1 = engine.subscribe(store, () => {
        if (isTimeTraveling) {
            isTimeTraveling = false;
        }
        else {
            const now = window.performance.now().toFixed(2);
            const action = currentAction && !currentAction.async ? currentAction : `Update (${now})`;
            dt.send(action, snapshot(store));
            currentAction = undefined;
        }
    });
    const unsub2 = dt.subscribe((message) => {
        var _a, _b, _c, _d, _e, _f;
        if (message.type !== 'DISPATCH')
            return;
        if (message.state) {
            if (((_a = message.payload) === null || _a === void 0 ? void 0 : _a.type) === 'JUMP_TO_ACTION' || ((_b = message.payload) === null || _b === void 0 ? void 0 : _b.type) === 'JUMP_TO_STATE') {
                isTimeTraveling = true;
            }
            const nextValue = JSON.parse(message.state);
            store(nextValue);
        }
        else if (((_c = message.payload) === null || _c === void 0 ? void 0 : _c.type) === 'COMMIT') {
            dt.init(snapshot(store));
        }
        else if (((_d = message.payload) === null || _d === void 0 ? void 0 : _d.type) === 'IMPORT_STATE') {
            const actions = (_e = message.payload.nextLiftedState) === null || _e === void 0 ? void 0 : _e.actionsById;
            const computedStates = ((_f = message.payload.nextLiftedState) === null || _f === void 0 ? void 0 : _f.computedStates) || [];
            isTimeTraveling = true;
            computedStates.forEach(({ state }, index) => {
                const action = actions[index] || `Update - ${new Date().toLocaleString()}`;
                store(state);
                if (index === 0)
                    dt.init(snapshot(store));
                else
                    dt.send(action, snapshot(store));
            });
        }
    });
    dt.init(snapshot(store));
    return () => {
        unsub0();
        unsub1();
        unsub2();
    };
};
function isEligible(o) {
    return (o === Object(o) &&
        ['[object Object]', '[object Function]', '[object AsyncFunction]'].includes(Object.prototype.toString.call(o)));
}
const createDevtoolsHelper = () => {
    const getAddress = (store, obj, actionAddress) => {
        if (!isEligible(obj))
            return obj;
        return new Proxy(obj, {
            get: (target, prop) => {
                if (prop === engine.META)
                    return target[engine.META];
                if (!isEligible(target[prop]))
                    return target[prop];
                const newActionAddress = actionAddress.map(i => i);
                newActionAddress.push(prop);
                return getAddress(store, obj[prop], newActionAddress);
            },
            apply(target, thisArg, args) {
                if (target[engine.META] || !store[engine.META].root.devtoolsChannel)
                    return Reflect.apply(target, thisArg, args);
                const storeAddress = store[engine.META].address.slice(1).map(shorten);
                const begin = storeAddress.length ? `(*.${storeAddress.join('.')})` : '*';
                const isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]';
                const action = { type: `${begin}.${actionAddress.map(nodot).join('.')}` };
                if (isAsync) {
                    //@ts-ignore
                    action.async = true;
                    let attemptTimes = calledTimesMap.get(target);
                    if (!attemptTimes) {
                        attemptTimes = { i: 0 };
                        calledTimesMap.set(target, attemptTimes);
                    }
                    attemptTimes.i++;
                    action.type = action.type + ' #' + attemptTimes.i;
                }
                store[engine.META].root.devtoolsChannel.notify(Object.assign(Object.assign({}, action), { args }));
                const result = Reflect.apply(target, thisArg, args);
                if (isAsync)
                    result.then(() => store[engine.META].root.devtoolsChannel.notify(Object.assign(Object.assign({}, action), { end: true })));
                else
                    store[engine.META].root.devtoolsChannel.notify(undefined);
                return result;
            },
        });
    };
    return getAddress;
};
const shorten = (s) => {
    return s.length < 10 ? nodot(s) : nodot(s.slice(0, 3)) + '..' + nodot(s.slice(-3));
};
const nodot = (s) => {
    return s.replace('.', '\\.');
};
const calledTimesMap = new WeakMap();

exports.devtools = devtools;
