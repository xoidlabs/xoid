import { deepClone, memberMap, parentMap, storeMap } from './utils'
import { StoreInternalAPI } from './createStore'
import { Store, GetStoreState, Useable } from './types'
import { subscribe, get } from './main'
import { error } from './error'
// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand

type Symbolic__ = any

export type Settings = string
export type StateSelector<T, U> = (state: T) => U
export type EqualityChecker<T> = (state: T, newState: unknown) => boolean
export type StateListener<T> = (state: T) => void
export type StateSliceListener<T> = (state: T | null, error?: Error) => void
export type StateGetter = <T extends Useable<any>>(store: T) => GetStoreState<T>
export type StateSetter = <T>(value: T, decorator?: any) => void

export type GetState<T> = () => T
export type SetState<T> = (
  value: T | ((state: T) => T),
  decorator?: (state: T, callback: (draft: T) => T | void) => void
) => void
export type Destroy = () => void
export interface Subscribe<T> {
  (listener: StateListener<T>): () => void
  <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice>
  ): () => void
}

export type ShallowSubscribe<T> = (listener: StateListener<T>) => void

// TODO: this seems removable
export type GetSymbolicState<T> = () => Store<T, any>

export const baseStore = <T>(
  init: T | ((get: StateGetter, set: StateSetter) => T),
  settings?: Settings
) => new BaseClass(init).store
export class BaseClass<T> {
  private state: T
  private normalizedState: any
  private symbolicState: any

  private isRecord: boolean
  private isSelector: boolean
  private initializer!: (get: StateGetter, set: StateSetter) => T

  store: Omit<StoreInternalAPI<T>, 'getActions'>

  private listeners: Set<StateListener<T>> = new Set()
  private shallowListeners: Set<StateListener<T>> = new Set()

  // Used by selector type stores
  private subscribedStores: any[] = []
  private selectorUnsubscriptions: (() => void)[] = []

  private childSubscriptions: (() => void)[] = []

  constructor(init: T | ((get: StateGetter, set: StateSetter) => T)) {
    // Determine if it's a selector, record it's initializer
    this.isRecord = false
    this.isSelector = typeof init === 'function'
    if (this.isSelector)
      this.initializer = init as (get: StateGetter, set: StateSetter) => T
    this.symbolicState = {}

    // Create the initial state
    this.state = this.isSelector
      ? (init as (get: StateGetter, set: StateSetter) => T)(
          this.stateGetter,
          this.stateSetter
        )
      : (init as T)

    // Keep symbolicState's prototype consistent with the actual state
    this.symbolicState = Array.isArray(this.state) ? [] : {}

    this.store = {
      get: this.get,
      getState: this.getNormalizedState,
      set: this.setState,
      destroy: this.destroy,
      subscribe: this.subscribe,
      shallowSubscribe: this.shallowSubscribe,
      getMutableCopy: this.getSymbolicState,
      setAsRecord: this.setAsRecord,
    }
    // Traverse the state to obtain {normalizedState} and {symbolicState}
    this.traverseState()
  }

  /**
   * Section: several get... and set.. methods
   */
  // IMPORTANT: reduce one of them
  get: GetState<T> = () => this.state
  getNormalizedState = () => this.normalizedState
  getSymbolicState = () => this.symbolicState
  setSymbolicState(payload: Symbolic__) {
    const { symbolicState } = this
    // delete all keys
    Object.keys(symbolicState).forEach((key) => delete symbolicState[key])
    // shallowmerge it to the
    Object.keys(payload).forEach((key) => (symbolicState[key] = payload[key]))
  }

  setAsRecord() {
    this.isRecord = true
  }

  /**
   * The following part is about the {setState} method.
   * {set} export is derived by using this.
   */

  setState: SetState<T> = (payload: any, produce?: any) => {
    if (typeof payload === 'function') {
      // Easy usage of {immer.produce} or other similar functions
      const nextState = produce
        ? produce(this.state, payload)
        : payload(this.state)
      this.setStateInner(nextState)
    } else if (
      // TODO: disable setting state with promises
      // This condition determines if the payload is an async function, by duck typing
      payload &&
      typeof (payload as Promise<any>)?.then === 'function' &&
      typeof (payload as Promise<any>)?.finally === 'function'
    ) {
      payload.then((result: T) => this.setStateInner(result))
    } else {
      this.setStateInner(payload)
    }
  }

  private setStateInner = (value: T) => {
    if (value !== this.state) {
      this.state = value
      // Do this to prepare symbolicState and normalizedState
      this.traverseState()
      // Fire listeners after the state is changed
      this.listeners.forEach((listener) => listener(this.state))
      this.shallowListeners.forEach((listener) => listener(this.state))
      // IMPORTANT: remove this Inform the parent store
      this.informTheParent()
    }
  }

  /**
   * Section: internals for selectors
   */

  stateGetter: StateGetter = (item) => {
    const ownerStore = ((storeMap.get(item) || memberMap.get(item)) as any)
      .internal
    if (!this.subscribedStores.includes(ownerStore)) {
      const unsubscribe = subscribe(item, this.stateGetterListener)
      this.subscribedStores.push(ownerStore)
      this.selectorUnsubscriptions.push(unsubscribe)
    }
    const val = get(item)
    return val
  }

  stateSetter: StateSetter = (value: any, decorator) => {
    this.setState(value, decorator)
  }

  stateGetterListener: () => void = () => {
    const newState = this.initializer(this.stateGetter, this.stateSetter)
    this.setStateInner(newState)
  }

  /**
   * Section: subscribing to the store.
   * The logic is kept almost identical with zustand's logic.
   * There's additional {shallowSubscribe} method that's used internally.
   */

  subscribeWithSelector = <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice>
  ) => {
    const listenerToAdd = () => {
      // Selector could throw but we don't want to stop the listener from
      // being called. https://github.com/react-spring/zustand/pull/37
      try {
        const newStateSlice = selector(this.state)
        listener(newStateSlice)
      } catch (error) {
        listener(null, error)
        error('internal-0')
      }
    }
    // subscribe, and return the unsubscriber
    this.listeners.add(listenerToAdd)
    return () => this.listeners.delete(listenerToAdd)
  }

  subscribe: Subscribe<T> = <StateSlice>(
    listener: StateListener<T> | StateSliceListener<StateSlice>,
    selector?: StateSelector<T, StateSlice>
  ) => {
    if (selector) {
      return this.subscribeWithSelector(
        listener as StateSliceListener<StateSlice>,
        selector
      )
    }
    this.listeners.add(listener as StateListener<T>)
    return () => this.listeners.delete(listener as StateListener<T>)
  }

  shallowSubscribe: ShallowSubscribe<T> = (listener) => {
    this.shallowListeners.add(listener as StateListener<T>)
    return () => this.shallowListeners.delete(listener as StateListener<T>)
  }

  /**
   * Section
   */

  destroy: Destroy = () => {
    this.listeners.clear()
    this.selectorUnsubscriptions.forEach((unsubscribe) => unsubscribe())
  }

  handleChildUpdate = () => {
    this.listeners.forEach((listener) => listener(this.state))
  }

  // TODO: make this a util
  updateValueOnAddress = (root: object, address: string[], newValue: any) => {
    if (address.length) {
      address.reduce((acc: any, key: any, i: number) => {
        if (i === address.length - 1) acc[key] = newValue
        return acc[key]
      }, root)
    } else {
      console.error('TODO: this must be unreachable?')
    }
  }

  informTheParent = () => {
    if (!this.isRecord) {
      const match = parentMap.get(this.getSymbolicState())
      if (match) {
        const { internal } = storeMap.get(match.parent) as any
        this.updateValueOnAddress(
          internal.getState(),
          match.address,
          this.normalizedState
        )
      }
    }
  }

  traverseState = () => {
    // generate copied one
    const [symbolic, normalized, children] = deepClone(
      this.state,
      this.store as StoreInternalAPI<T>
    )
    // set new normalizedState and symbolicState
    this.normalizedState = normalized
    this.setSymbolicState(symbolic)

    // Remove all previous subscriptions to children
    this.childSubscriptions.forEach((unsubscribe) => unsubscribe())
    // Subscribe to the changes of children
    this.childSubscriptions = [...children].map((item) =>
      item.internal.shallowSubscribe(this.handleChildUpdate)
    )
  }
}
