import { Root } from './root'
import { error } from './errors'
import { getData, isRootData, pure } from './utils'
import { Initializer, After, Store, Value, Decorator, StateOf } from './types'
export { objectOf, arrayOf } from './model'

/**
 * Creates a store with the first argument as the initial state.
 * Second argument runs after the state is created.
 * Store actions can be specified in the return value of the second argument.
 * @see https://xoid.dev/docs/api/create
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
  value: StateOf<T> | ((state: StateOf<T>) => StateOf<T>),
  decorator?: Decorator<T>
): void => {
  const data = getData(item)
  if (!data) throw error('set')

  const { root, source, key } = data
  const prevValue = source[key] as T

  if (typeof value === 'function') {
    // Easy usage of {immer.produce} or other similar functions
    const nextValue: T = decorator
      ? decorator(prevValue, value as (state: T) => T)
      : (value as (state: T) => T)(prevValue)
    root.handleStateChange(source, key, nextValue as T)
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
  if (isRootData(data)) return data.root.getActions()
  else throw error('use')
}

/**
 * Subscribes to a store, or a value.
 * @see https://xoid.dev/docs/api/subscribe
 */

export const subscribe = <T>(
  item: Value<T>,
  fn: (state: StateOf<T>) => void
) => {
  const data = getData(item)
  if (!data) throw error('subscribe')
  if (!isRootData(data)) {
    return data.root.subscribe(() => fn(data.source[data.key] as any))
  } else {
    const unsubs = []
    // TODO: intercepting might be needed
    const subscriber = () => fn(data.source[data.key] as any)
    unsubs.push(data.root.subscribe(subscriber))
    data.root.substores.forEach((substore) => {
      if (addressBeginsWith(substore.address, data.address)) {
        unsubs.push(substore.root.subscribe(subscriber))
      }
    })
  }
}
