import type { Atom, Stream, Init, Actions } from './internal/types'
import { createAtom, tools } from './internal/utils'
import { derived } from './internal/derived'
import { store } from './internal/store'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach actions to the atom.
 * @see [xoid.dev/docs/quick-tutorial](https://xoid.dev/docs/quick-tutorial)
 */
export function atom<T>(init: Init<T>): Atom<T>
export function atom<T, U>(init: Init<T>, getActions?: (a: Atom<T>) => U): Atom<T> & Actions<U>
export function atom<T>(): Stream<T>
export function atom<T, U = undefined>(this, init?: Init<T>, getActions?: (a: Atom<T>) => U) {
  // @ts-ignore
  const baseStore = (typeof init === 'function' ? derived : store).call(this, init)
  // @ts-ignore
  baseStore.isStream = !arguments.length

  // @ts-ignore
  return createAtom(baseStore, getActions)
}

atom.plugins = [] as ((a: Atom<any>) => void)[]

// intentionally untyped
;(atom as any).internal = tools
