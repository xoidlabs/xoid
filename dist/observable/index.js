'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var engine = require('@xoid/engine');

const observable = (init) => {
    const isFunction = typeof init === 'function';
    const meta = { root: engine.createRoot(), node: init };
    const target = engine.createTarget(meta);
    //@ts-ignore
    const obj = Object.assign(target, { [engine.META]: meta });
    if (isFunction)
        engine.createSelector(obj, init);
    return obj;
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
exports.observable = observable;
