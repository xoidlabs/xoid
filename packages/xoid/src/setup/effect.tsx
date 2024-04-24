import { temporarySwap } from '../utils/temporarySwap'
import { add } from '../utils/add'
import { fire } from '../utils/fire'
import { SHARED } from '../core/shared'

import type { Destructor } from '../utils/types'

export type EffectCallback = () => void | Destructor

export type EffectController = {
  mount: () => void
  unmount: () => void
}

export const effect = (callback: EffectCallback): (() => EffectController) => {
  // An `adder` is in charge of collecting other effect callbacks,
  // and their disposal functions into two sets.
  const mount = new Set<() => void>()
  const unmount = new Set<() => void>()
  const adder = (fn: () => EffectCallback) => mount.add(() => add(unmount, fn()()))

  // `effect` returns a function. It doesn't immediately run its callback, because
  // the current setup (could be useSetup) should be able to delay the topmost effect call.
  // Then, it's topmost effect's duty to start/stop nested effects, and also to collect disposal
  // functions for things like `watch`, `.subscribe`.
  return SHARED.add(() => {
    add(unmount, temporarySwap(callback, 'add')(adder))
    // // After our parent effect is executed, do not immediately execute its child effects.
    // return () => {
    //   // keepListeners: true is set
    //   fire(mount, true)
    //   return () => fire(unmount)
    // }
    return {
      mount: () => fire(mount, true),
      unmount: () => fire(unmount),
    }
  })
}
