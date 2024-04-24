import { fire } from '../utils/fire'
import { store } from './store'
import type { GetState } from './types'

export function selector<T>(fn: (get: GetState) => T) {
  // @ts-expect-error
  const piece = store<T>()

  let isPending = true
  const event = new Set<() => void>()
  const { get, listeners } = piece
  piece.get = () => {
    if (isPending) {
      fire(event)
      isPending = false
      piece.set(fn(getter))
    }
    return get()
  }
  const getter = (pieceLike) => {
    event.add(
      pieceLike.subscribe(() => {
        if (listeners.size) piece.get()
        else isPending = true
      })
    )
    return pieceLike.get()
  }

  return piece
}
