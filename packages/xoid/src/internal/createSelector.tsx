import { createInternal, tools } from './utils'
import { GetState } from './types'
import { createEvent } from './createEvent'
import { INTERNAL } from './createFocus'

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
    return read[INTERNAL].get()
  }

export const createSelector = <T,>(init: (get: GetState) => T) => {
  const internal = createInternal()
  const { get, set, listeners } = internal
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
    tools.get = internal.track ? getter : null
    set(init(getter))
    tools.get = prevTracker
  }

  internal.get = () => {
    if (isPending) evaluate()
    return get()
  }
  return internal
}
