import { createBaseApi, createEvent, createInternal, Internal } from './lite'
import { Atom, GetState } from '../types'

export const INTERNAL = Symbol()

export const shallowCopy = (obj: unknown) =>
  Array.isArray(obj)
    ? obj.map((s) => s) // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

export function getIn(obj: any, path: string[], cache = false): any {
  if (!path.length) return obj
  const nextPath = path.map((a) => a)
  const key = nextPath.shift() as string
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], nextPath, cache)
}

export function setIn<T>(obj: T, path: string[], value: any): T {
  if (!path.length) return value
  const rest = path.map((a) => a)
  const key = rest.shift() as string
  const nextObj = shallowCopy(obj)
  nextObj[key] = setIn((obj as any)[key], rest, value)
  return nextObj
}

export const createGetState =
  (updateState: Function, add: (fn: Function) => void): GetState =>
  // @ts-ignore
  (read, sub) => {
    if (sub) {
      add(sub(updateState))
      return read()
    }
    add(read.subscribe(updateState))
    return read.value
  }

export const createSelector = <T,>(internal: Internal<T>, init: (get: GetState) => T) => {
  const { get, set, listeners } = internal
  const { add, fire } = createEvent()

  let isPending = true
  // TODO: When "ended", make sure to cleanupAll
  const getter = createGetState(() => {
    // We're here when an invalidation signal dispatches.
    if (listeners.size) evaluate()
    else isPending = true
  }, add)

  const evaluate = () => {
    // cleanup previous subscriptions
    fire()
    isPending = false
    set(init(getter))
  }

  ;(internal as any).evaluate = evaluate

  return () => {
    if (isPending) evaluate()
    return get()
  }
}

const createPathProxy = (path: string[]): any =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === INTERNAL) return path
        const pathClone = path.map((s) => s) // avoid _spread polyfill
        pathClone.push(key as string)
        return createPathProxy(pathClone)
      },
    }
  )

export const pathProxy = createPathProxy([])

export const getPath = <T extends (...args: any) => any>(fn: T): string[] => fn(pathProxy)[INTERNAL]

const withCache = (cache: any, path: string[], fn: any) => {
  const attempt = getIn(cache, path, true)
  const memoizedResult = attempt && attempt[INTERNAL]
  if (memoizedResult) return memoizedResult
  return (attempt[INTERNAL] = fn())
}

export const createFocus =
  <T,>(internal: Internal<T>, basePath = [] as string[]): Atom<T>['focus'] =>
  (key: any) => {
    const relativePath = typeof key === 'function' ? getPath(key) : [key]
    if (!internal.cache) internal.cache = {}
    const path = basePath.concat(relativePath)
    const { get, set, listeners, subscribe } = internal
    return withCache(internal.cache, path, () =>
      createApi(
        {
          listeners,
          subscribe,
          get: () => (get() ? getIn(get(), path) : undefined),
          set: (value: T) => set(setIn(get(), path, value)),
        },
        internal,
        relativePath
      )
    )
  }

export const createStream =
  <T,>(internal: Internal<T>): Atom<T>['pass'] =>
  // @ts-ignore
  (selector: any, truthy: any) => {
    let prevValue: any
    // @ts-ignore
    const { get, set, listeners, subscribe } = createInternal()
    const getResult = () => {
      const result = selector(internal.get(), prevValue)
      if (!(truthy && result === undefined)) {
        set(result)
        prevValue = result
      }
    }
    const listener = () => {
      if (!listeners.size) return
      getResult()
    }
    return createApi({
      get,
      set,
      listeners,
      subscribe: (fn) => {
        const unsub = internal.subscribe(listener)
        const unsub2 = subscribe(fn)
        return () => {
          unsub()
          unsub2()
        }
      },
    })
  }

export const createApi = <T,>(
  nextInternal: Internal<T>,
  internal = nextInternal,
  relativePath = [] as string[]
) => {
  const nextAtom = createBaseApi(nextInternal) as unknown as Atom<T>
  nextAtom.focus = createFocus(internal, relativePath)
  nextAtom.pass = createStream(internal)
  ;(nextAtom as any)[INTERNAL] = internal
  return nextAtom
}
