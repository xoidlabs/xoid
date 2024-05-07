import { Store, store } from './store'
import { Atom } from './types'
import { createAtom } from './utils'

export const createStream =
  <T,>(source: Store<T>): Atom<T>['map'] =>
  // @ts-ignore
  (selector: any, isFilter: any) => {
    let prevValue: any
    // @ts-ignore
    const target = store()

    let isPending = true
    const listener = () => {
      if (target.listeners.size) evaluate()
      else isPending = true
    }

    const evaluate = () => {
      const v = source.get()
      const result = selector(v, prevValue)
      isPending = false
      if (!(isFilter && !result)) {
        target.set(result)
        prevValue = result
      }
    }

    return createAtom({
      ...target,
      get: () => {
        if (!source.isStream && isPending) evaluate()
        return target.get()
      },
      isStream: isFilter || source.isStream,
      subscribe: (fn) => {
        const unsub = source.subscribe(listener)
        const unsub2 = target.subscribe(fn)
        return () => {
          unsub2()
          if (!target.listeners.size) unsub()
        }
      },
    })
  }
