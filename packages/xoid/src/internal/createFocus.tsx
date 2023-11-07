import { Internal } from './lite'
import { Atom } from './types'
import { createApi } from './utils'

export const INTERNAL = Symbol()

export const shallowCopy = (obj: unknown) =>
  Array.isArray(obj)
    ? obj.slice() // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

// A recursive function that retrieves a value from a nested object using a path of keys.
// It has an optional caching mechanism. It traverses the object based on the provided path
// and returns the value at the specified path.
export function getIn(obj: any, path: string[], cache = false, index = 0): any {
  if (index === path.length) return obj
  const key = path[index]
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], path, cache, index + 1)
}

// A recursive function that sets a value in a nested object using a path of keys.
// It returns a new object with the updated value at the specified path. If the new value
// is the same as the current value, it returns the original object without making changes.
export function setIn<T>(obj: T, path: string[], value: any, index = 0): T {
  if (index === path.length) return value
  const key = path[index]
  const currentValue = (obj as any)[key]
  const nextValue = setIn(currentValue, path, value, index + 1)
  if (nextValue === currentValue) return obj
  const nextObj = shallowCopy(obj)
  nextObj[key] = nextValue
  return nextObj
}

const createPathProxy = (path: string[]): any =>
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
const withCache = (cache: any, path: string[], fn: any) => {
  const attempt = getIn(cache, path, true)
  const memoizedResult = attempt && attempt[INTERNAL]
  if (memoizedResult) return memoizedResult
  return (attempt[INTERNAL] = fn())
}

export const createFocus =
  <T,>(internal: Internal<T>, basePath = [] as string[]): Atom<T>['focus'] =>
  (key: any) => {
    const relativePath = typeof key === 'function' ? key(pathProxy)[INTERNAL] : [key]
    if (!internal.cache) internal.cache = {}
    const path = basePath.concat(relativePath)
    const { get } = internal
    const nextInternal = {
      listeners: internal.listeners,
      subscribe: internal.subscribe,
      isStream: internal.isStream,
      get: () => {
        const obj = get()
        return obj ? getIn(obj, path) : undefined
      },
      // `internal.atom.set` reference is used here instead of `internal.set`,
      // because enhanced atoms need to work with focused atoms as well.
      set: (value: T) => (internal.atom as Atom<unknown>).set(setIn(get(), path, value)),
    }
    return withCache(internal.cache, path, () => createApi(nextInternal, internal, path))
  }
