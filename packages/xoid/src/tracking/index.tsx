import type { Atom } from 'xoid/atom/types'
import { atom } from '../atom/atom'
import { temporarySwap } from '../utils/temporarySwap'
import type { Destructor } from '../utils/types'

export const watch = (fn: () => void | Destructor) => computed(fn).subscribe((cleanup) => cleanup)

export const computed = <T,>(fn: () => T): Atom<T> => atom(temporarySwap(fn, 'get'))
