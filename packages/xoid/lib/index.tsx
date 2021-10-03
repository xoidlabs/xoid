import { subscribe as _subscribe, effect as _effect } from '@xoid/engine'

export type { Init, Atom, Listener, StateOf } from '@xoid/engine'
export type { Useable } from './create'

export { create, use } from './create'
export { select } from './select'

/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

export const subscribe = _subscribe

/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */

export const effect = _effect
