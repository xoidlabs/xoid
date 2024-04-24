import { fire } from '../utils/fire'
import { store } from './store'
import type { GetState, Store } from './types'

export function selector<T>(fn: (get: GetState) => T) {
  // @ts-expect-error:
  const baseStore = store<T>()
  const $isDirty = store(true)
  baseStore.$isDirty = $isDirty
  const { get, listeners } = baseStore
  const cleanupSet = new Set<() => void>()

  // `.get()` causes getter to run and collect the unsubs into the set. This means even though it
  // doesn't have subscribers, it holds its internal `isDirty` state valid. However this creates a
  // problem: now, the dependency is recomputed every time even if it doesn't have subscribers.
  // Therefore, dirty-checking mechanism should not subscribe to a store, it should subscribe to an
  // internal isDirty store.
  baseStore.get = () => {
    if ($isDirty.get()) {
      fire(cleanupSet)
      $isDirty.set(false)
      baseStore.set(fn(getter))
    }
    return get()
  }

  const getter = <U,>(otherStore: Store<U>) => {
    cleanupSet.add(
      (otherStore.$isDirty || otherStore).subscribe(() => {
        if (listeners.size) baseStore.get()
        else $isDirty.set(true)
      })
    )
    return otherStore.get()
  }
  // We don't fire cleanupSet on last unsubscription, because we're gonna keep listening to other
  // `$isDirty` stores in order to keep the internal isDirty state valid.
  return baseStore
}
