import { Root } from './root'
import { error } from './errors'
import { getData } from './utils'
import {
  Initializer,
  After,
  Store,
  Value,
  Decorator,
  GetState,
  SetState,
} from './types'

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

export const get: GetState = <T>(item: Value<T>): T => {
  const data = getData(item)
  if (data) return data.getValue()
  else throw error('get')
}

/**
 * Sets the value of a store, or a value.
 * @see https://xoid.dev/docs/api/set
 */

export const set: SetState = <T>(
  item: Value<T>,
  value: T | ((state: T) => T | Promise<T>),
  decorator?: Decorator<T>
): void => {
  const data = getData(item)
  if (data) data.setValue(value, decorator)
  else throw error('set')
}

/**
 * Gets actions of a store.
 * Actions are defined at the second argument of `createStore` or `createModel` methods.
 * @see https://xoid.dev/docs/api/use
 */

export const use = <T, Actions>(item: Store<T, Actions>): Actions => {
  const data = getData(item)
  if (data && !data.address.length) return data.root.getActions()
  else throw error('use')
}

/**
 * Gets the parent of a store.
 * @see https://xoid.dev/docs/api/parent
 */

export const parent = (item: Store<any>): Store<unknown> => {
  const data = getData(item)
  if (data && !data.address.length) return data.root.getParent()
  else throw error('parent')
}

/**
 * Subscribes to a store, or a value.
 * @see https://xoid.dev/docs/api/subscribe
 */

export const subscribe = <T>(item: Value<T>, fn: (state: T) => void) => {
  const data = getData(item)
  if (data) {
    const { address, root } = data
    if (address.length) {
      const selector = new Root((get) => get(item))
      return selector.subscribe(fn as any)
    } else {
      return root.subscribe(fn)
    }
  } else throw error('subscribe')
}
