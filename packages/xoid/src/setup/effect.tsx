import { temporarySwap } from '../utils/temporarySwap'
import { add } from '../utils/add'
import { fire } from '../utils/fire'
import { SHARED } from '../core/shared'

import type { Destructor } from '../utils/types'

export type EffectCallback = () => void | Destructor

export const effect = (callback: EffectCallback) => {
  // An `adder` is in charge of collecting other effect callbacks,
  // and their disposal functions in the two sets.
  const mount = new Set<() => void>()
  const unmount = new Set<() => void>()
  const adder = (fn: () => EffectCallback) => mount.add(() => add(unmount, fn()()))

  return SHARED.add(() => {
    add(unmount, temporarySwap(callback, 'add')(adder))
    // After our parent effect is executed, do not immediately execute its child effects.
    return () => {
      // keepListeners: true is set
      fire(mount, true)
      return () => fire(unmount)
    }
  })
}
