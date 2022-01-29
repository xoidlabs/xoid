import {
  createNotifier,
  createSelector,
  createTarget,
  META,
  USEABLE,
  Init,
  Atom,
} from '@xoid/engine'

const useable = Symbol()
export type Useable<U> = { [useable]: U }

/**
 * Gets the "useable" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export const use = <U extends any>(atom: Useable<U>): U => (atom as any)[USEABLE]

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T>(): Atom<T | undefined>
export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, useable?: (atom: Atom<T>) => U): Atom<T> & Useable<U>
export function create<T, U = undefined>(init?: Init<T>, useable?: (atom: Atom<T>) => U): Atom<T> {
  const meta = { notifier: createNotifier(), node: init }
  const target = createTarget(meta)
  if (typeof init === 'function') createSelector(target as unknown as Atom<T>, init as Function)
  ;(target as any)[META] = meta
  if (useable && typeof useable === 'function') (target as any)[USEABLE] = useable(target as any)
  return target as any
}
