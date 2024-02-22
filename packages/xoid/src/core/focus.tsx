import { INTERNAL } from './shared'
import { setIn } from './setIn'
import { store } from './store'
import type { Store } from './types'

type StoreInternal<T> = Store<T> & {
  root?: StoreInternal<unknown>
  path?: string[]
  cache?: Record<string, unknown>
}

export function focus<T, U>(baseStore: Store<T>, fn: (state: T) => U) {
  // Use the root ref
  const root = ((baseStore as StoreInternal<T>).root || baseStore) as StoreInternal<T>
  if (!root.cache) root.cache = new Proxy([], pathHandler)
  // Auto-generate the path array using the proxy
  const path = fn(root.cache as T) as string[]
  // Finally cache the ref
  return (
    path[INTERNAL] ||
    (path[INTERNAL] = store({
      root,
      path,
      get: () => fn(root.get()),
      set: (state) => root.set(setIn(root.get(), path, state)),
      subscribe: () => root.subscribe(fn),
    }))
  )
}

const pathHandler = { get: (acc, key) => new Proxy((acc[key] = [...acc, key]), pathHandler) }
