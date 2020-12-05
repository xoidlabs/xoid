import { Root } from './root'
import { error } from './errors'
import { getData, pure } from './utils'
import { Initializer, After, Store, Value, Decorator, StateOf } from './types'

/**
 * Creates a store with the first argument as the initial state.
 * Second argument runs after the state is created.
 * Store actions can be specified in the return value of the second argument.
 * @see https://xoid.dev/docs/api/create-store
 */

export function create<T, Actions = undefined>(
  init: T | Initializer<T>,
  after?: After<T, Actions>
): Store<T, Actions> {
  const root = new Root(init, after)
  return root.getStore()
}

/**
 * Gets the value of a store, or a value.
 * @see https://xoid.dev/docs/api/get
 */

export const get = <T>(item: Value<T>): StateOf<T> => {
  const data = getData(item)
  if (data) return pure(data)
  else throw error('get')
}

/**
 * Sets the value of a store, or a value.
 * @see https://xoid.dev/docs/api/set
 */

export const set = <T extends Value<any>>(
  item: T,
  value: StateOf<T> | ((state: StateOf<T>) => StateOf<T> | Promise<StateOf<T>>),
  decorator?: Decorator<T>
): void => {
  const data = getData(item)
  if (!data) throw error('set')

  const { root, source, key } = data
  const prevValue = source[key] as T

  if (typeof value === 'function') {
    // Easy usage of {immer.produce} or other similar functions
    const nextValue: T | Promise<T> = decorator
      ? decorator(prevValue, value as (state: T) => T | Promise<T>)
      : (value as (state: T) => T | Promise<T>)(prevValue)

    if (
      // This condition determines if the payload is a promise, by duck typing
      nextValue &&
      typeof (nextValue as Promise<unknown>)?.then === 'function' &&
      typeof (nextValue as Promise<unknown>)?.finally === 'function'
    ) {
      ;(nextValue as Promise<T>).then((promiseResult: T) =>
        root.handleStateChange(source, key, promiseResult)
      )
    } else {
      root.handleStateChange(source, key, nextValue as T)
    }
  } else {
    root.handleStateChange(source, key, value)
  }
}

/**
 * Gets actions of a store.
 * Actions are defined at the second argument of `createStore` or `createModel` methods.
 * @see https://xoid.dev/docs/api/use
 */

export const use = <T, Actions>(item: Store<T, Actions>): Actions => {
  const data = getData(item)
  if (data && (data.root as Record<any, any>) === data.source)
    return data.root.getActions()
  else throw error('use')
}

/**
 * Subscribes to a store, or a value.
 * @see https://xoid.dev/docs/api/subscribe
 */

export const subscribe = <T>(item: Value<T>, fn: (state: T) => void) => {
  const data = getData(item)
  if (data) {
    if ((data.root as Record<any, any>) === data.source) {
      const selector = new Root((get) => get(item))
      return selector.subscribe(fn as any)
    } else {
      return data.root.subscribe(fn)
    }
  } else throw error('subscribe')
}
