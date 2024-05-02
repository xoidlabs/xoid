import type { Destructor } from '../utils/types'
import { fire } from '../utils/fire'
import { add } from '../utils/add'
import type { Store } from './store'
import { SHARED } from './shared'

export const subscribe = <T,>(
  mw: Store<T>,
  fn: (state: T, prevState: T) => void | Destructor,
  watch?: boolean
) => {
  const set = new Set<() => void>()
  let prevState = mw.get()

  const callback = (state: T) => add(set, fn(state, prevState))

  if (watch) callback(prevState)

  const unsubscribe = mw.subscribe((state) => {
    // this check holds, because sometimes even though root is updated, some branch might be intact.
    if (state !== prevState) {
      fire(set)
      callback(state)
      prevState = state
    }
  })

  const dispose = () => {
    fire(set)
    unsubscribe()
  }

  SHARED.add(() => () => dispose)

  return dispose
}
