import { INTERNAL } from './shared'
import { setIn } from './setIn'
import { store } from './store'
import type { Store } from './types'

type StoreInternal<T> = Store<T> & {
  root?: StoreInternal<unknown>
  path?: string[]
  cache?: Record<string, unknown>
}

export function focus<T, U>(baseStore: Store<T>, key: (state: T) => U) {
  const fn = typeof key === 'function' ? key : (s) => s[key]
  // Use the root store
  const rootStore = ((baseStore as StoreInternal<T>).root || baseStore) as StoreInternal<T>
  // If the root store doesn't have a cache, create it.
  if (!rootStore.cache) rootStore.cache = new Proxy({ [INTERNAL]: [] }, pathHandler)
  // In case if we're in an intermediate node, use the store cache, and obtain the next
  // node's cache.
  const cacheNode = fn((baseStore as any).cache)
  const path = cacheNode[INTERNAL] as string[]

  // Finally cache the store
  return (
    (path as any)[INTERNAL] ||
    ((path as any)[INTERNAL] = store.call({
      root: rootStore,
      cache: cacheNode,
      get: () => fn(rootStore.get()),
      set: (state) => rootStore.set(setIn(rootStore.get(), path, state)),
      subscribe: () => rootStore.subscribe(fn),
    }))
  )
}

const pathHandler = {
  get: (acc, key) => {
    const pathArray = acc[INTERNAL]

    if (key === INTERNAL) return pathArray
    const nextAcc = { [INTERNAL]: [...pathArray, key] }
    acc[key] = nextAcc
    return new Proxy(nextAcc, pathHandler)
  },
}
