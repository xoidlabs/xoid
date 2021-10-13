export const META = Symbol()
export const RECORD = Symbol()
export const USEABLE = Symbol()

const atom = Symbol()
export type IsAtom = { [atom]: true }
export type Atom<T> = {
  [atom]: true
  (): T
  (state: Exclude<T, Function>): void
  (fn: (state: T) => T): void
}

export type GetState = {
  <T>(atom: Atom<T>): T
  <T, U>(atom: Atom<T>, selector: (state: T) => U): U
  <T, U extends keyof T>(atom: Atom<T>, selector: U): T[U]
}
export type Init<T> = T | ((get: GetState) => T)
export type Listener<T> = (
  value: T,
  prevValue: T
) => unknown | ((value: T, prevValue: T) => () => unknown)
export type StateOf<T extends Atom<any>> = T extends Atom<infer P> ? P : never

// @xoid/tree package also depends on the following shape of LiteMeta,
// so don't mess with it unless there's a good reason
type LiteMeta = { node: any; root: { notify: (value?: any) => void } }
export const createTarget = (
  meta: LiteMeta,
  onSet = (meta: LiteMeta, value: any) => {
    meta.node = value
    meta.root.notify()
  }
) => {
  return function (input?: any) {
    if (arguments.length === 0) return meta.node
    const nextValue = typeof input === 'function' ? input(meta.node) : input
    if (meta.node === nextValue) return
    onSet(meta, nextValue)
  }
}

export const createRoot = () => {
  const listeners = new Set<(value: any) => void>()
  const notify = (value: any) => listeners.forEach((listener) => listener(value))
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return { notify, subscribe }
}

export const createCleanup = () => {
  const unsubs = new Set<Function>()
  const onCleanup = (fn: Function) => void unsubs.add(fn)
  const cleanupAll = () => {
    unsubs.forEach((fn) => fn())
    unsubs.clear()
  }
  return { onCleanup, cleanupAll }
}

const createGetter =
  (updateState: Listener<unknown>): GetState =>
  (atom, selector) => {
    const item = selector ? select(atom, selector) : atom
    onCleanup(subscribe(item, updateState))
    return item()
  }

export const createSelector = (atom: Atom<any>, init: Function) => {
  const { onCleanup, cleanupAll } = createCleanup()
  const getter = (atom: Atom<any>) => {
    onCleanup(subscribe(atom, updateState))
    return atom()
  }
  const updateState = () => {
    cleanupAll()
    const result = init(getter)
    atom(result)
  }
  updateState()
}

const createSubscribe =
  (effect: boolean) =>
  <T extends Atom<any>>(atom: T, fn: Listener<StateOf<T>>): (() => void) => {
    // cleanup + runCleanup
    let cleanup: unknown
    const runCleanup = () => {
      if (cleanup && typeof cleanup === 'function') cleanup()
      cleanup = undefined
    }
    // Listener
    let prevValue = atom()
    const listener = () => {
      const nextValue = atom()
      if (nextValue !== prevValue) {
        runCleanup()
        cleanup = fn(nextValue, prevValue)
        prevValue = nextValue
      }
    }
    // If it's an effect, also collect the cleanup value at the first run
    if (effect) cleanup = fn(prevValue, prevValue)
    // Actually subscribe internally
    const unsub = (atom as any)[META].root.subscribe(listener)
    // Return unsub
    return () => {
      runCleanup()
      unsub()
    }
  }

/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

export const subscribe = createSubscribe(false)

/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
export const effect = createSubscribe(true)
