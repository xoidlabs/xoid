import { createRoot, createSelector, createTarget, META, USEABLE, Init, Atom } from '@xoid/engine'

const useable = Symbol()
export type Useable<U> = { [useable]: U }
export const use = <U extends any>(store: Useable<U>): U => (store as any)[USEABLE]

export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, useable?: (store: Atom<T>) => U): Atom<T> & Useable<U>
export function create<T, U = undefined>(init: Init<T>, useable?: (store: Atom<T>) => U): Atom<T> {
  const meta = { root: createRoot(), node: init }
  const target = createTarget(meta)
  Object.assign(target, {
    [META]: meta,
    // @ts-ignore
    [USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
  })
  if (typeof init === 'function') createSelector(target as unknown as Atom<T>, init as Function)
  return target as any
}
