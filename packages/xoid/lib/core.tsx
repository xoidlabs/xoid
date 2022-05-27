import {
  createNotifier,
  createGetState,
  createCleanup,
  createTarget,
  META,
  USABLE,
  Init,
  Atom,
} from '@xoid/engine'
import { select } from './utils'
import type { GetState } from '@xoid/engine'

const usable = Symbol()
export type Usable<U> = { [usable]: U }
export type Enhancer<T = unknown> = (defaultSetter: (value: T) => void) => (value: T) => void

/**
 * Gets the "usable" of an atom.
 * When used with the second argument, it selects a partial atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export function use<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>
export function use<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>
export function use<T extends any>(atom: Usable<T>): T
export function use(atom: any, fn?: any): any {
  if (arguments.length === 1) {
    const u = (atom as any)[USABLE]
    const dh = (atom as any)[META].devtoolsHelper
    return dh ? dh(atom, u) : u
  }
  return select(atom, fn)
}

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "usable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T>(): Atom<T | undefined>
export function create<T>(init: Init<T>): Atom<T>
export function create<T>(init: Init<T>, usable?: null, enhancer?: Enhancer<T>): Atom<T>
export function create<T, U>(
  init: Init<T>,
  usable?: (atom: Atom<T>) => U,
  enhancer?: Enhancer<T>
): Atom<T> & Usable<U>
export function create<T, U = undefined>(
  init?: Init<T>,
  usable?: ((atom: Atom<T>) => U) | null,
  enhancer?: Enhancer<T>
): Atom<T> {
  const meta = { notifier: createNotifier(), node: init }
  let isValid = true
  let evaluate: Function // only populated when it's a selector
  const setter = (value: T) => {
    meta.node = value
    meta.notifier.notify()
  }
  const target = createTarget(
    () => {
      if (!isValid) evaluate()
      return meta.node
    },
    enhancer ? enhancer(setter) : setter
  ) as Atom<T>
  ;(target as any)[META] = meta

  // if it's maybe a selector
  if (typeof init === 'function') {
    isValid = false
    const { onCleanup, cleanupAll } = createCleanup()
    evaluate = () => {
      cleanupAll()
      const result = (init as (get: GetState) => T)(getter)
      meta.node = result
      isValid = true
      if (target() === result) return
      meta.notifier.notify()
    }
    const invalidate = () => {
      // invalidations shouldn't directly cause re-evaluation if there are no listeners.
      if (meta.notifier.listeners.size) {
        evaluate()
      } else isValid = false
    }
    const getter = createGetState(invalidate, onCleanup)
  }
  if (usable && typeof usable === 'function') (target as any)[USABLE] = usable(target)
  return target
}
