import { error } from './error'
import { Root } from './root'
import { getData, transform } from './transform'
import { GetStoreState, Initializer, X } from './types'
import { getValueByAddress } from './utils'

type TODO = any

/**
 * Creates a store with the first argument as the initial state.
 * Second argument runs after the state is created.
 * Store actions can be specified in the return value of the second argument.

 * @see https://xoid.dev/docs/api/create-store
 */

export function createStore<T, Actions = undefined>(
  init: T | Initializer<T>,
  after?: X.After<T, Actions>
): X.Store<T, Actions> {
  const root = new Root(init, after)
  return root.getStore()
}

/**
 * Gets the value of a store.
 *
 * @see https://xoid.dev/docs/api/get
 */

export const get = <T extends X.Value<any>>(item: T): GetStoreState<T> => {
  const data = getData(item)
  if (data) return data.root.getValue(data.address)
  else throw error('get')
}

/**
 * Sets the value of a store.
 *
 * @see https://xoid.dev/docs/api/set
 */

export const set = <T extends X.Value<any>>(
  item: T,
  value: TODO,
  decorator?: TODO
): void => {
  const data = getData(item)
  if (data) data.root.setState(value, decorator, data.address)
  else throw error('set')
}

/**
 * Gets actions of a store.
 * Actions are defined at the second argument of `createStore` or `createModel` methods.
 *
 * @see https://xoid.dev/docs/api/use
 */

export const use = <T, Actions>(item: X.Store<T, Actions>): Actions => {
  const data = getData(item)
  if (data && !data.address.length) return data.root.getActions()
  else throw error('use')
}

/**
 * Gets the parent of a store.
 *
 * @see https://xoid.dev/docs/api/parent
 */

export const parent = (item: X.Store<any>): X.Store<unknown> => {
  const data = getData(item)
  if (data && !data.address.length) return data.root.getParent()
  else throw error('parent')
}
