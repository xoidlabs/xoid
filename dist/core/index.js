'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('./utils');
var engine = require('@xoid/engine');

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
const create = utils.createInstance();
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
const subscribe = engine.subscribe;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
const effect = engine.effect;

exports.create = create;
exports.effect = effect;
exports.subscribe = subscribe;
