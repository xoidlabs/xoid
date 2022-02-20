import {
  createNotifier,
  createSelector,
  createTarget,
  META,
  USEABLE,
  Init,
  Atom,
} from '@xoid/engine'
import { select } from './select'

const useable = Symbol()
export type Useable<U> = { [useable]: U }
export type Middleware<T = unknown> = (prev: { set: (value: T) => void }) => (value: T) => void

/**
 * Gets the "useable" of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export function use<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>
export function use<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>
export function use<T extends any>(atom: Useable<T>): T
export function use(atom: any, fn?: any): any {
  if (arguments.length === 1) return (atom as any)[USEABLE]
  return select(atom, fn)
}

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T>(): Atom<T | undefined>
export function create<T>(init: Init<T>): Atom<T>
export function create<T>(init: Init<T>, useable?: null, middleware?: Middleware<T>): Atom<T>
export function create<T, U>(
  init: Init<T>,
  useable?: (atom: Atom<T>) => U,
  middleware?: Middleware<T>
): Atom<T> & Useable<U>
export function create<T, U = undefined>(
  init?: Init<T>,
  useable?: ((atom: Atom<T>) => U) | null,
  middleware?: Middleware<T>
): Atom<T> {
  const meta = { notifier: createNotifier(), node: init }
  const defaultSetter = (value: T) => {
    meta.node = value
    meta.notifier.notify()
  }
  const target = createTarget(
    () => meta.node,
    middleware ? middleware({ set: defaultSetter }) : defaultSetter
  ) as Atom<T>
  if (typeof init === 'function') createSelector(target, init)
  ;(target as any)[META] = meta
  if (useable && typeof useable === 'function') (target as any)[USEABLE] = useable(target)
  return target
}
