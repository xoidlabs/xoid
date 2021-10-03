import { createInstance } from './utils';
import { subscribe as subscribe$1, effect as effect$1 } from '@xoid/engine';

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
const create = createInstance();
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
const subscribe = subscribe$1;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
const effect = effect$1;

export { create, effect, subscribe };
