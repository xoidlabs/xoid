import { atom } from '../atom'
import { temporarySwap } from '../utils/temporarySwap'
import { IDENTITY } from 'xoid/core/shared'

import type { Atom } from '../atom'
import type { Destructor } from '../utils/types'

export const watch = (fn: () => void | Destructor) => {
  const atom = computed((x) => {
    // Return a new object each time, because subscribers need to run on every recomputation
    return { c: fn(x) }
  })

  console.log(atom.value)
  return atom.subscribe((a) => {
    console.log({ a })
    return a.c
  })
}

export const computed = <T,>(fn: () => T): Atom<T> => atom(temporarySwap(fn, 'get'))
