import {
  createNotifier,
  createSelector,
  createTarget,
  META,
  USABLE,
  Init,
  Atom,
} from '@xoid/engine'

const usable = Symbol()
export type Usable<U> = { [usable]: U }

/**
 * Gets the "usable" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export const use = <U extends any>(atom: Usable<U>): U => (atom as any)[USABLE]

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "usable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T>(): Atom<T | undefined>
export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, usable?: (atom: Atom<T>) => U): Atom<T> & Usable<U>
export function create<T, U = undefined>(init?: Init<T>, usable?: (atom: Atom<T>) => U): Atom<T> {
  const meta = { notifier: createNotifier(), node: init }
  const target = createTarget(meta)
  if (typeof init === 'function') createSelector(target as unknown as Atom<T>, init as Function)
  Object.assign(target, {
    [META]: meta,
    // @ts-ignore
    [USABLE]: usable && typeof usable === 'function' ? usable(target) : undefined,
  })
  return target as any
}
