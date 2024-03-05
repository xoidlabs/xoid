import { provide, inject, has } from './scope'

declare const reactivity: unique symbol
export type Feature<T, U> = ((options: T) => U) & { [reactivity]: never }

export function feature<T, U>(fn: (options: T) => U): Feature<T, U> {
  return ((options) => {
    if (has(fn as Feature<T, U>)) {
      return inject(fn as Feature<T, U>)
    }
    const instance = fn(options)
    provide(fn as Feature<T, U>, instance)
    return instance
  }) as Feature<T, U>
}
