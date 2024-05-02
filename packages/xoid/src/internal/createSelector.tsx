import { GetState } from './types'
import { createEvent } from './createEvent'
import { INTERNAL } from './createFocus'
import { store } from '../core/store'

export function createSelector <T,>(init: (get: GetState) => T) {
  // @ts-expect-error:
  const baseStore = store<T>()
  const { get, set, listeners } = baseStore
  const cleanupSet = createEvent()
  let isPending = true

  const updateState = () => {
    if (listeners.size) evaluate()
    else isPending = true
  }

  const getter = (otherStore) => {
    cleanupSet.add(otherStore.subscribe(updateState))
    // TODO: remove INTERNAL when get() is added
    return otherStore[INTERNAL].get()
  }

  // Evaluation occurs if .get is called, also occurs when listeners are non-empty
  const evaluate = () => {
    // cleanup previous subscriptions
    cleanupSet.fire()
    isPending = false
    set(init(getter as any))
  }

  baseStore.get = () => {
    if (isPending) evaluate()
    return get()
  }
  return baseStore
}


