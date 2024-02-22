import { SHARED } from '../core/shared'

export const temporarySwap =
  <T,>(fn: () => T, key: string) =>
  (source: any) => {
    const prevValue = SHARED[key]
    SHARED[key] = source
    const result = fn()
    SHARED[key] = prevValue
    return result
  }
