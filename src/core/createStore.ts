import {
  Destroy,
  GetSymbolicState,
  Subscribe,
  ShallowSubscribe,
  BaseClass,
} from './baseStore'
import { Initializer, X } from './types'

export type StoreInternalAPI<T> = BaseClass<T, any>

/**
 * Creates a store with the first argument as the initial state.
 * Second argument runs after the state is created.
 * Store actions can be specified in the return value of the second argument.
 *
 * @see https://xoid.dev/docs/api/create-store
 */

export function createStore<State, Actions = undefined>(
  init: State | Initializer<State>,
  after?: X.After<State, Actions>
): X.Store<State, Actions> {
  // Create the store without actions
  const store = new BaseClass(init, after)
  const mutableCopy = store.getSymbolicState()
  return mutableCopy
}
