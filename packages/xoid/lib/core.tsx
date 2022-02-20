import {
  createNotifier,
  createSelector,
  createTarget,
  META,
  USEABLE,
  Init,
  Atom,
} from '@xoid/engine'
import { select } from './utils'

const useable = Symbol()
export type Useable<U> = { [useable]: U }
export type Enhancer<T = unknown> = (defaultSetter: (value: T) => void) => (value: T) => void

/**
 * Gets the "useable" of an atom.
 * When used with the second argument, it selects a partial atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export function use<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>
export function use<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>
export function use<T extends any>(atom: Useable<T>): T
export function use(atom: any, fn?: any): any {
  if (arguments.length === 1) {
    const u = (atom as any)[USEABLE]
    const dh = (atom as any)[META].devtoolsHelper
    return dh ? dh(atom, u) : u
  }
  return select(atom, fn)
}

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T>(): Atom<T | undefined>
export function create<T>(init: Init<T>): Atom<T>
export function create<T>(init: Init<T>, useable?: null, enhancer?: Enhancer<T>): Atom<T>
export function create<T, U>(
  init: Init<T>,
  useable?: (atom: Atom<T>) => U,
  enhancer?: Enhancer<T>
): Atom<T> & Useable<U>
export function create<T, U = undefined>(
  init?: Init<T>,
  useable?: ((atom: Atom<T>) => U) | null,
  enhancer?: Enhancer<T>
): Atom<T> {
  const meta = { notifier: createNotifier(), node: init }
  const setter = (value: T) => {
    meta.node = value
    meta.notifier.notify()
  }
  const target = createTarget(() => meta.node, enhancer ? enhancer(setter) : setter) as Atom<T>
  ;(target as any)[META] = meta
  if (typeof init === 'function') createSelector(target, init)
  if (useable && typeof useable === 'function') (target as any)[USEABLE] = useable(target)
  return target
}
