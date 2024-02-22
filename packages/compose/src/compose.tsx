import { IDENTITY } from 'xoid/core/shared'
import { provide, setup } from 'xoid'

type Setup<T, U> = (options: T) => U

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export function compose<P extends Setup<any, any>>(
  this: symbol | void,
  plugins: P[]
): (options: UnionToIntersection<Parameters<P>[0]>) => {
  types: UnionToIntersection<ReturnType<P>>
  mount: () => () => void
  symbol: symbol
}

export function compose<P extends Setup<any, any>, T>(
  this: symbol | void,
  plugins: P[],
  callback: (payload: {
    types: UnionToIntersection<ReturnType<P>>
    mount: () => () => void
    symbol: symbol
  }) => T
): (options: UnionToIntersection<Parameters<P>[0]>) => T

export function compose<P extends Setup<any, any>, T>(
  this: symbol | void,
  plugins: P[],
  callback = IDENTITY as (payload: {
    types: UnionToIntersection<ReturnType<P>>
    mount: () => () => void
    symbol: symbol
  }) => T
) {
  return (options: UnionToIntersection<Parameters<P>[0]>) => {
    const sym = this || Symbol()
    const mount = setup.call(sym, () => {
      plugins.map((fn) => provide(fn, fn(options)))
    })[1] as () => () => void
    return callback({
      symbol: sym,
      mount,
      types: {} as any,
    })
  }
}
