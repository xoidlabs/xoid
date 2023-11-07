import { createInternal, Internal } from './utils'
import { Atom } from './types'
import { createApi } from './utils'

export const createStream =
  <T,>(internal: Internal<T>): Atom<T>['map'] =>
  // @ts-ignore
  (selector: any, isFilter: any) => {
    let prevValue: any
    // @ts-ignore
    const nextInternal = createInternal()

    let isPending = true
    const listener = () => {
      if (nextInternal.listeners.size) evaluate()
      else isPending = true
    }

    const evaluate = () => {
      const v = internal.get()
      const result = selector(v, prevValue)
      isPending = false
      if (!(isFilter && !result)) {
        nextInternal.set(result)
        prevValue = result
      }
    }

    return createApi({
      get: () => {
        if (!internal.isStream && isPending) evaluate()
        return nextInternal.get()
      },
      set: nextInternal.set,
      listeners: nextInternal.listeners,
      isStream: isFilter || internal.isStream,
      subscribe: (fn) => {
        const unsub = internal.subscribe(listener)
        const unsub2 = nextInternal.subscribe(fn)
        return () => {
          unsub2()
          if (!nextInternal.listeners.size) unsub()
        }
      },
    })
  }
