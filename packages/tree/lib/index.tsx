import { createInstance } from './utils'
import { subscribe as _subscribe, effect as _effect } from '@xoid/engine'
import type { Init, Atom } from '@xoid/engine'
export type { Atom, Init, GetState, Listener, StateOf } from '@xoid/engine'

export type AtomTree<T> = Atom<T> & (T extends object ? { [K in keyof T]: AtomTree<T[K]> } : {})

export type Create = {
  <T>(init: Init<T>): AtomTree<T>
}

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export const create: Create = createInstance()

/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

export const subscribe = _subscribe

/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */

export const effect = _effect
