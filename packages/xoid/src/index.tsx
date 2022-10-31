import type { Atom, Stream, Init, GetState, Usable } from './types'
import { createSelector, createApi, INTERNAL } from './internal/utils'
import { createEvent, createInternal } from './internal/lite'

export * from './types'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach more actions to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
export function create<T>(): Stream<T>
export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, getUsable?: (atom: Atom<T>) => U): Atom<T> & Usable<U>
export function create<T, U = undefined>(init?: Init<T>, getUsable?: (atom: Atom<T>) => U) {
  const isFunction = typeof init === 'function'
  const internal = createInternal((isFunction ? undefined : init) as T)
  if (isFunction) internal.get = createSelector(internal, init as (get: GetState) => T)
  const atom = createApi(internal)
  ;(atom as any)[INTERNAL].usable = getUsable?.(atom)
  return atom
}

/**
 * Gets the "usables" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export const use = <T extends any>(atom: Usable<T>): T => (atom as any)[INTERNAL].usable
;(use as any).symbol = INTERNAL
;(use as any).createEvent = createEvent
;(use as any).devtools = <T,>(value: T): T => value
