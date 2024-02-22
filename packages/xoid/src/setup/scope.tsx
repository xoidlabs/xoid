import { SHARED } from '../core/shared'
import { temporarySwap } from '../utils/temporarySwap'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
export interface InjectionKey<T> extends Symbol {}

const err = () => {
  throw new Error('Exports such as `provide` and `context` only work inside a context.')
}

SHARED.ctx = { get: err, set: err } as unknown as ContextMap

type ContextMap = WeakMap<InjectionKey<unknown>, unknown>

const contextRegistry = new Map<symbol, ContextMap>()

export function scope<T>(this: symbol, fn: () => T) {
  // Get the weakMap associated with the symbol
  let map = contextRegistry.get(this)
  if (!map) {
    map = new WeakMap()
    contextRegistry.set(this, map)
  }
  return temporarySwap(fn, 'ctx')(map)
}

export const provide = <T,>(symbol: InjectionKey<T>, value: T) => SHARED.ctx.set(symbol, value)

export const inject = <T,>(symbol: InjectionKey<T>) => SHARED.ctx.get(symbol) as T

export const frameworkSymbol = Symbol()
