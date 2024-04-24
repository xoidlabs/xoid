import { provide, inject, has } from './scope'

declare const FEATURE: unique symbol
export type Feature<T, U> = ((options: T) => U) & { [FEATURE]: never }

/**
 * `feature` is used to define a function that can be injected **once** in a `setup` context.
 * This injection can be done using the `inject` function, or it can be done implicitly via
 * simply calling the function.
 *
 * @param fn - a callback function that receives options, and returns an instance or a value.
 * @returns a function with the same interface as `fn`, but it's recognized by the `inject` function.
 */
export function feature<T, U>(fn: (options: T) => U): Feature<T, U> {
  const nextFn = ((options) => {
    if (has(nextFn as Feature<T, U>)) return inject(fn as Feature<T, U>)
    const instance = fn(options)
    provide(nextFn as Feature<T, U>, instance)
    return instance
  }) as Feature<T, U>
  return nextFn
}
