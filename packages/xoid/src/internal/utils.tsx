import { createBaseApi, createEvent, createInternal, Internal } from './lite'
import { Atom, GetState } from '../types'

export const INTERNAL = Symbol()

export const shallowCopy = (obj: unknown) =>
  Array.isArray(obj)
    ? obj.slice() // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

export function getIn(obj: any, path: string[], cache = false): any {
  if (!path.length) return obj
  const nextPath = path.slice()
  const key = nextPath.shift() as string
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], nextPath, cache)
}

export function setIn<T>(obj: T, path: string[], value: any): T {
  if (!path.length) return value
  const nextPath = path.slice()
  const key = nextPath.shift() as string
  const nextObj = shallowCopy(obj)
  nextObj[key] = setIn((obj as any)[key], nextPath, value)
  return nextObj
}

export const createGetState =
  (updateState: () => void, add: (fn: Function) => void): GetState =>
  // @ts-ignore
  (read, sub) => {
    if (sub) {
      add(sub(updateState))
      return read()
    }
    // @ts-ignore
    add(read.subscribe(updateState))
    // @ts-ignore
    return read.value
  }

export const createSelector = <T,>(internal: Internal<T>, init: (get: GetState) => T) => {
  const { get, set, listeners } = internal
  const { add, fire } = createEvent()

  let isPending = true
  const getter = createGetState(() => {
    if (listeners.size) evaluate()
    else isPending = true
  }, add)

  const evaluate = () => {
    // cleanup previous subscriptions
    fire()
    isPending = false
    set(init(getter))
  }

  return () => {
    if (isPending) evaluate()
    return get()
  }
}

const createPathProxy = (path: string[], nullish?: boolean): any =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === INTERNAL) return path
        const pathClone = path.slice() // avoid _spread polyfill
        pathClone.push(key as string)
        return createPathProxy(pathClone)
      },
    }
  )

const pathProxy = createPathProxy([])

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
    const { get } = internal
    const nextInternal = {
      listeners: internal.listeners,
      subscribe: internal.subscribe,
      get: () => (get() ? getIn(get(), path) : undefined),
      set: (value: T) => (internal.atom as Atom<unknown>).set(setIn(get(), path, value)),
      isStream: internal.isStream,
    }
    return withCache(internal.cache, path, () => createApi(nextInternal, internal, path))
  }

export const createStream =
  <T,>(internal: Internal<T>): Atom<T>['map'] =>
  // @ts-ignore
  (selector: any, isFilter: any) => {
    let prevValue: any
    // @ts-ignore
    const nextInternal = createInternal()

    let isPending = true
    const listener = () => {
      if (nextInternal.listeners.size) evaluate()
      else isPending = true
    }

    const evaluate = () => {
      const v = internal.get()
      const result = selector(v, prevValue)
      isPending = false
      if (!(isFilter && !result)) {
        nextInternal.set(result)
        prevValue = result
      }
    }

    return createApi({
      get: () => {
        if (!internal.isStream && isPending) evaluate()
        return nextInternal.get()
      },
      set: nextInternal.set,
      listeners: nextInternal.listeners,
      isStream: isFilter || internal.isStream,
      subscribe: (fn) => {
        const unsub = internal.subscribe(listener)
        const unsub2 = nextInternal.subscribe(fn)
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
  nextAtom.map = createStream(nextInternal)
  ;(nextAtom as any)[INTERNAL] = nextInternal
  nextInternal.atom = nextAtom
  return nextAtom
}
