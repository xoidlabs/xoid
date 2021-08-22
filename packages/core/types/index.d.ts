export type { Store, Value, Init, GetState, SetState, State, Listener, Create } from './types';
/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
export declare const create: import("./types").Create;
export { subscribe } from './utils';
