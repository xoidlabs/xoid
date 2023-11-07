import { Internal } from './utils'
import { GetState } from './types'
import { createEvent } from './createEvent'

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

  internal.get = () => {
    if (isPending) evaluate()
    return get()
  }
}
