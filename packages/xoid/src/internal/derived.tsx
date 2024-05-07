import { tools } from './utils'
import { GetState } from './types'
import { createEvent } from './createEvent'
import { store } from './store'

export const createGetState =
  (updateState: () => void, add: (fn: Function) => void): GetState =>
  // @ts-ignore
  (source: any, sub) => {
    if (sub) {
      add(sub(updateState))
      return source()
    }
    // @ts-ignore
    add(source.subscribe(updateState))
    return source.get()
  }

export const derived = <T,>(init: (get: GetState) => T) => {
  const baseStore = store()
  const { get, set, listeners } = baseStore
  const e = createEvent()

  let isPending = true
  const getter = createGetState(() => {
    if (listeners.size) evaluate()
    else isPending = true
  }, e.add)

  const evaluate = () => {
    // cleanup previous subscriptions
    e.fire()
    isPending = false
    const prevTracker = tools.get
    // @ts-ignore
    tools.get = baseStore.track ? getter : null
    set(init(getter))
    tools.get = prevTracker
  }

  baseStore.get = () => {
    if (isPending) evaluate()
    return get()
  }
  return baseStore
}
