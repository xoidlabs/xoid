'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@xoid/core/utils');
var engine = require('@xoid/engine');

function ready(store) {
    const customTarget = (address = []) => {
        let sourceStore;
        let hasLastValue = false;
        let lastValue;
        const onSet = (_meta, value) => {
            if (sourceStore) {
                lastValue = undefined;
                hasLastValue = false;
                return sourceStore(value);
            }
            lastValue = value;
            hasLastValue = true;
        };
        // @ts-ignore
        const targetStore = utils.createInstance({ onSet })(undefined, true);
        const meta = targetStore[engine.META];
        const setTargetStore = (state) => {
            if (meta.node === state)
                return;
            meta.node = state;
            meta.root.notify();
        };
        engine.effect(store, () => {
            const state = store();
            if (!state)
                return;
            sourceStore = address.reduce((acc, prop) => acc[prop], store);
            // if it suddenly appears, and it has a last value to set
            if (hasLastValue)
                return onSet(meta, lastValue);
            if (targetStore)
                setTargetStore(sourceStore());
        });
        return targetStore;
    };
    return addressProxy(customTarget, []);
}
function addressProxy(fn, address) {
    return new Proxy(fn(address), {
        get: (target, prop) => {
            if (prop === engine.META)
                return target[engine.META];
            const newAddress = address.map(s => s);
            newAddress.push(prop);
            return addressProxy(fn, newAddress);
        },
    });
}

exports.ready = ready;
