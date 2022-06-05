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
import { select, createSetValue } from './utils'
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
  const getValue = () => {
    if (!isValid) evaluate()
    return meta.node
  }

  const setValue = createSetValue(getValue, meta, enhancer)
  const target = createTarget(getValue, setValue) as Atom<T>
  ;(target as any)[META] = meta

  // If the state initializer is a function, use lazily evaluate that function when the
  // state is being read.
  if (typeof init === 'function') {
    // Start with invalid (not-yet-evaluated) state
    isValid = false
    const { onCleanup, cleanupAll } = createCleanup()

    const getter = createGetState(() => {
      // This is where an invalidation signal dispatches. If there are listeners,
      // invalidations cause re-evaluation without setting `isValid` to `false`.
      if (meta.notifier.listeners.size) evaluate()
      // If there are no listeners on the other hand, they set `isValid` to `false`.
      // This way, if a subscriber is attached the next time, or the state value is read,
      // `createTarget` will call `evaluate`.
      else isValid = false
    }, onCleanup)

    evaluate = () => {
      cleanupAll()
      const result = (init as (get: GetState) => T)(getter)
      meta.node = result
      isValid = true
      if (target() === result) return
      meta.notifier.notify()
    }
  }
  if (usable && typeof usable === 'function') (target as any)[USABLE] = usable(target)
  return target
}
