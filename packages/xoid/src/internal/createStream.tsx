import { Internal } from './utils'
import { Atom } from './types'
import { createAtom } from './utils'
import { store } from '../core/store'

export const createStream =
  <T,>(internal: Internal<T>): Atom<T>['map'] =>
  // @ts-ignore
  (selector: any, isFilter: any) => {
    const nextInternal = store.call(() => internal.subscribe(() => {
      if (listeners.size) evaluate()
      // this case means, when we have no listeners, we can still mark ourselves dirty.
      else isDirty = true
    }))
    const { get, set, listeners } = nextInternal

    let isDirty = true

    const evaluate = () => {
      const result = selector(internal.get())
      isDirty = false
      if (!isFilter || result != null) set(result)
    }

    // If the
    nextInternal.get = () => {
      if (!internal.isStream && isDirty) evaluate()
      return get()
    }
    nextInternal.isStream = isFilter || internal.isStream

    return createAtom(nextInternal)
  }
