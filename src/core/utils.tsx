import { META } from './core'
import { resolverFactory } from './resolverFactory'
import { Detransform, Store, Unsub } from './types'

export const hasOwnProperty = Object.prototype.hasOwnProperty

export const isPrimitive = (value: any) =>
  (typeof value !== 'object' && typeof value !== 'function') || value === null

export const createDebounced = (fn: Function) => {
  let to: number
  return () => {
    if (to) clearTimeout(to)
    to = setTimeout(fn)
  }
}

export const watchHelper = <T extends any>(store: Store<T>, fn: () => void) => {
  const meta = (store as any)[META]
  const resolver = resolverFactory({
    symbol: META,
    interceptor: (meta) =>
      unsubs.add((meta as any).extras.subscribe(debounced)),
  })
  const unsubs = new Set<Unsub>()
  const unsubAll = () => {
    unsubs.forEach((fn) => fn())
    unsubs.clear()
  }
  const debounced = createDebounced(fn)
  const getter = (): Detransform<T> => resolver(meta.parentMeta, meta.key)
  return [unsubAll, getter] as const
}
