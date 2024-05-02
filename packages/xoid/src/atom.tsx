import type { Atom, Stream, Init, Actions } from './internal/types'
import { createAtom } from './internal/utils'
import { store } from './core/store'
import { createSelector } from './internal/createSelector'
import { SHARED } from './core/shared'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach actions to the atom.
 * @see [xoid.dev/docs/quick-tutorial](https://xoid.dev/docs/quick-tutorial)
 */
export function atom<T>(init: Init<T>): Atom<T>
export function atom<T, U>(init: Init<T>, getActions?: (a: Atom<T>) => U): Atom<T> & Actions<U>
export function atom<T>(): Stream<T>
export function atom<T, U = undefined>(init?: Init<T>, getActions?: (a: Atom<T>) => U) {
  // @ts-ignore
  const internal = (typeof init === 'function' ? createSelector : store)(init)
  // @ts-ignore
  internal.isStream = !arguments.length

  // @ts-ignore
  return createAtom(internal, getActions)
}

atom.plugins = [] as ((a: Atom<any>) => void)[]

// intentionally untyped
;(atom as any).internal = SHARED
