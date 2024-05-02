import { setIn } from '../core'
import { Atom } from './types'
import { createAtom, Internal } from './utils'

export const INTERNAL = Symbol()

// A recursive function that retrieves a value from a nested object using a path of keys.
// It has an optional caching mechanism. It traverses the object based on the provided path
// and returns the value at the specified path.
export function getIn(obj: any, path: string[], cache = false, index = 0): any {
  if (index === path.length) return obj
  const key = path[index]
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], path, cache, index + 1)
}

const handler = {
  get: (path, key) => {
    if (key === INTERNAL) return path
    return new Proxy([...path, key], handler)
  },
}

const pathProxy = new Proxy([], handler)

export const createFocus =
  <T,>(internal: Internal<T>, basePath: string[]): Atom<T>['focus'] =>
  (key: any) => {
    const relativePath = typeof key === 'function' ? key(pathProxy)[INTERNAL] : [key]
    if (!internal.cache) internal.cache = {}
    const path = basePath.concat(relativePath)
    const { get } = internal
    const attempt = getIn(internal.cache, path, true)
    return (
      attempt[INTERNAL] ||
      (attempt[INTERNAL] = createAtom({
        ...internal,
        path,
        get: () => {
          const obj = get()
          return obj ? getIn(obj, path) : undefined
        },
        // `internal.atom.set` reference is used here instead of `internal.set`,
        // because enhanced atoms need to work with focused atoms as well.
        set: (value: T) => (internal.atom as Atom<unknown>).set(setIn(get(), path, value)),
      }))
    )
  }
