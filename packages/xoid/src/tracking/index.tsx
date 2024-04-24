import { atom } from '../atom'
import { temporarySwap } from '../utils/temporarySwap'

import type { Atom } from '../atom'
import type { Destructor } from '../utils/types'

export const watch = (fn: () => void | Destructor) => {
  // Internal `computed` callback needs to return a new reference each time. Because only then
  // `.subscribe`'s callback would run, and we want it to run each time after the first callback
  // runs, as it's in charge of its cleanups.
  // `watch` is subscribed immediately. This runs the internal `computed` callback immediately.
  return computed(() => ({ c: fn() })).subscribe((a) => a.c)
}

export const computed = <T,>(fn: () => T): Atom<T> => atom(temporarySwap(fn, 'get'))
