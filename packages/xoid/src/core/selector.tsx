import { fire } from '../utils/fire'
import { store } from './store'
import type { GetState } from './types'

export function selector<T>(fn: (get: GetState) => T) {
  // @ts-expect-error
  const mw = store<T>()

  let isPending = true
  const event = new Set<() => void>()
  const { get, listeners } = mw
  mw.get = () => {
    if (isPending) {
      fire(event)
      isPending = false
      mw.set(fn(getter))
    }
    return get()
  }
  const getter = (ref) => {
    event.add(
      ref.subscribe(() => {
        if (listeners.size) mw.get()
        else isPending = true
      })
    )
    return ref.get()
  }

  return mw
}
