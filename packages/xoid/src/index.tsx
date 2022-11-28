import type { Atom, Stream, Init, GetState, Usable } from './types'
import { createSelector, createApi, INTERNAL } from './internal/utils'
import { createEvent, createInternal } from './internal/lite'

export * from './types'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach "usables" to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/quick-tutorial)
 */
export function create<T>(): Stream<T>
export function create<T>(init: Init<T>): Atom<T>
export function create<T>(init: Init<T>, getUsable: null): Atom<T>
export function create<T, U>(init: Init<T>, getUsable?: (atom: Atom<T>) => U): Atom<T> & Usable<U>
export function create<T, U = undefined>(
  init?: Init<T>,
  getUsable?: null | ((atom: Atom<T>) => U)
) {
  const isFunction = typeof init === 'function'
  const initialValue = (isFunction ? undefined : init) as T
  const internal = createInternal(initialValue, (() => (use as any).devtools.send(atom)) as any)
  internal.isStream = !arguments.length
  if (isFunction) internal.get = createSelector(internal, init as (get: GetState) => T)
  const atom = createApi(internal)
  use.plugins.forEach((fn: any) => fn(atom, initialValue))
  internal.usable = getUsable?.(atom)
  return atom
}

/**
 * Gets the "usables" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/quick-tutorial)
 */
export const use = <T extends any>(atom: Usable<T>): T =>
  _use.devtools.wrap((atom as any)[INTERNAL].usable, atom)

// Untyped stuff for devtools
const _use = use as any
_use.symbol = INTERNAL
_use.createEvent = createEvent
_use.devtools = {
  send: <T,>(_atom: T) => void 0,
  wrap: <T,>(value: T): T => value,
}

use.plugins = [] as ((atom: Atom<any>, initialValue?: any) => void)[]
