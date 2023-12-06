import { Destructor } from '../../xoid/src'
import { createInternal, subscribeInternal } from '../../xoid/src/internal/utils'

// This is a lightweight version of xoid that doesn't have the following features:
// selectors, actions, `focus` and `map` methods.

export type LiteAtom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (state: T, prevState: T) => void | Destructor): () => void
  watch(fn: (state: T, prevState: T) => void | Destructor): () => void
}

export const createBaseApi = <T,>(value: T): LiteAtom<T> => {
  const { get, set, subscribe } = createInternal(value)
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const api: LiteAtom<T> = {
    get value() {
      return get()
    },
    set value(item) {
      api.set(item)
    },
    set: (value: any) => set(value),
    update: (fn: any) => api.set(fn(get())),
    subscribe: subscribeInternal(subscribe, get),
    watch: subscribeInternal(subscribe, get, true),
  }
  return api
}
