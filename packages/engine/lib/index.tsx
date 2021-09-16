export const META = Symbol()
export const RECORD = Symbol()
export const USEABLE = Symbol()

const observable = Symbol()
export type Observable<T> = {
  [observable]: true
  (): T
  (state: T): void
  (fn: (state: T) => T): void
}

export type IsObservable = { [observable]: true }

export type GetState = {
  <T>(store: Observable<T>): T
  <T>(store: Observable<T | undefined>): T | undefined
}
export type Init<T> = T | ((get: GetState) => T)
export type Listener<T> = (state: T) => unknown | ((state: T) => () => unknown)
export type StateOf<T extends Observable<any>> = T extends Observable<infer P> ? P : never

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
    const newValue = typeof input === 'function' ? input(meta.node) : input
    if (meta.node === newValue) return
    onSet(meta, newValue)
  }
}

export const createRoot = () => {
  const listeners = new Set<(value: any) => void>()
  const notify = (value: any) => listeners.forEach((listener) => listener(value))
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return { listeners, notify, subscribe }
}

export const createSelector = (store: Observable<any>, init: any) => {
  const unsubs = new Set<() => void>()
  const getter = (store: Observable<any>) => {
    unsubs.add(subscribe(store, updateState))
    return store()
  }
  const updateState = () => {
    unsubs.forEach((fn) => fn())
    unsubs.clear()
    return store((init as Function)(getter))
  }
  updateState()
}

const createSubscribe = (effect: boolean) => <T extends Observable<any>>(
  store: T,
  fn: Listener<StateOf<T>>
): (() => void) => {
  let prevValue = store()
  let cleanup: unknown
  const runCleanup = () => {
    if (cleanup && typeof cleanup === 'function') cleanup()
    cleanup = undefined
  }
  const listener = () => {
    runCleanup()
    const nextValue = store()
    if (nextValue !== prevValue) cleanup = fn(nextValue as any)
    prevValue = nextValue
  }
  if (effect) fn(store())
  const unsub = (store as any)[META].root.subscribe(listener)
  return () => {
    runCleanup()
    unsub()
  }
}

export const subscribe = createSubscribe(false)
export const effect = createSubscribe(true)
