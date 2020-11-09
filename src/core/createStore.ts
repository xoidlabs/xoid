import {
  Destroy,
  GetSymbolicState,
  GetState,
  SetState,
  Subscribe,
  ShallowSubscribe,
  baseStore,
} from './baseStore'
import { configObject } from './config'
import { error } from './error'
import { Store, After, Initializer } from './types'
import { storeMap } from './utils'

export type GetActions<A> = () => A

export interface StoreInternalAPI<T> {
  getMutableCopy: GetSymbolicState<T>
  getActions: GetActions<any>
  get: GetState<T>
  getNormalizedState: GetState<T>
  set: SetState<T>
  setInner: (value: T) => void
  subscribe: Subscribe<T>
  shallowSubscribe: ShallowSubscribe<T>
  destroy: Destroy
  setAsRecord: any
}

/**
 * ```js
 * createStore<State, Actions = undefined>(
 *   init: State | (get?: XGet<State>, set?: InitSet<State>) => State,
 *   after?: (store: Store<State>) => Actions
 * ) => Store<State, Actions>
 * ```
 * Creates a store with the first argument as the initial state.
 * Second argument runs after the state is first created.
 * Store actions can be specified in the return value of the second argument.
 * Function form of the first argument can be used to create derived state.
 *
 * [API Docs](https://xoid.dev/docs/api/create-store/)
 *
 */

export function createStore<State, Actions = undefined>(
  init: State | Initializer<State>,
  after?: After<State, Actions>
): Store<State, Actions> {
  // Create the store without actions
  const store = baseStore(init)

  // Actions
  let actions: Actions
  const getActions = () => actions
  const setActions = (after?: After<State, Actions>) => {
    if (after) {
      if (typeof after === 'function') {
        actions = after(mutableCopy)
      } else {
        throw error('action-function')
      }
      // @ts-ignore
      mutableCopy[configObject.actionsSymbol] = actions
    }
  }

  // Extend the internal API
  Object.assign(store, { getActions, setActions })

  // Finally return its symbolicState
  const mutableCopy = store.getMutableCopy()
  storeMap.set(mutableCopy, { internal: store as any, address: [] })

  setActions(after)

  return mutableCopy
}
