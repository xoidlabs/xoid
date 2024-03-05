import { IDENTITY } from 'xoid/core/shared'
import { provide, setup } from 'xoid'
import type { Feature } from 'xoid'

export type ComposeController<P extends Feature<any, any>> = {
  types: UnionToIntersection<ReturnType<P>>
  mount: () => () => void
  symbol: symbol
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

/**
 * The first argument accepts and array of features. The function that's returned will combine the
 * options of the features as an intersection object. A context symbol can be supplied in the
 * thisArg. This override will return a {@link ComposeController}.
 */
export function compose<P extends Feature<any, any>>(
  this: symbol | void,
  plugins: P[]
): (options: UnionToIntersection<Parameters<P>[0]>) => ComposeController<P>

/**
 * This override has all the properties of the other override, however, by using a second argument,
 * you can return anything you want instead of the  {@link ComposeController}. The second argument
 * also has the context of the whole thing, so things like `inject` can be used.
 */
export function compose<P extends Feature<any, any>, T>(
  this: symbol | void,
  plugins: P[],
  callback: (controller: ComposeController<P>) => T
): (options: UnionToIntersection<Parameters<P>[0]>) => T

export function compose<P extends Feature<any, any>, T>(
  this: symbol | void,
  plugins: P[],
  callback = IDENTITY as (payload: ComposeController<P>) => T
) {
  return (options: UnionToIntersection<Parameters<P>[0]>) => {
    // Create a symbol right here, if one is not supplied. This is especially useful when the
    // callback in the second argument is not used.
    const contextSymbol = this || Symbol()
    const mount = setup.call(contextSymbol, () => {
      // Use the function references as injection keys, and supply them to the current setup context.
      plugins.map((fn) => provide(fn, fn(options)))
      // Grab the mount/unmount controller.
    })[1] as () => () => void
    // Finally return
    return setup.call(contextSymbol, () =>
      callback({
        symbol: contextSymbol,
        mount,
        types: {} as UnionToIntersection<ReturnType<P>>,
      })
    )
  }
}
