import {
  deepClone,
  memberMap,
  parentMap,
  setValueByAddress,
  storeMap,
} from './utils'
import { StoreInternalAPI } from './createStore'
import { X, XGet, InitSet, Initializer } from './types'
import { get } from './main'
import { error } from './error'
import { configObject } from './config'
// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand
type Symbolic__ = any

export type StateSelector<T, U> = (state: T) => U
export type StateListener<T> = (state: T) => void
export type StateSliceListener<T> = (state: T | null, error?: Error) => void
export interface Subscribe<T> {
  (listener: StateListener<T>): () => void
  <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice>
  ): () => void
}
export type Destroy = () => void

export type ShallowSubscribe<T> = (listener: StateListener<T>) => void

// TODO: this seems removable
export type GetSymbolicState<T> = () => X.Store<T, any>

export class BaseClass<T, A> {
  private state: T
  private normalizedState: any
  private symbolicState: any

  private isRecord: boolean
  private isSelector: boolean
  private initializer!: Initializer<T>

  private listeners: Set<StateListener<T>> = new Set()
  private shallowListeners: Set<StateListener<T>> = new Set()

  private childSubscriptions: (() => void)[] = []

  constructor(init: T | Initializer<T>, after?: X.After<T, A>) {
    // Determine if it's a selector, record it's initializer
    this.isRecord = false
    this.isSelector = typeof init === 'function'
    if (this.isSelector) this.initializer = init as Initializer<T>
    this.symbolicState = {}

    // Create the initial state
    this.state = this.isSelector
      ? (init as Initializer<T>)(this.stateGetter, this.stateSetter)
      : (init as T)

    // Keep symbolicState's prototype consistent with the actual state
    this.symbolicState = Array.isArray(this.state) ? [] : {}

    // Traverse the state to obtain {normalizedState} and {symbolicState}
    this.traverseState()
    storeMap.set(this.symbolicState, {
      internal: this as any,
      address: [],
    })
    this.setActions(after)
  }

  /**
   * Section: several get... and set.. methods
   */
  // IMPORTANT: reduce one of them
  getState: X.GetState<T> = () => this.state
  getNormalizedState = () => this.normalizedState
  getSymbolicState = () => this.symbolicState
  setSymbolicState(payload: Symbolic__) {
    const { symbolicState } = this
    // delete all keys
    Object.keys(symbolicState).forEach((key) => delete symbolicState[key])
    // shallowmerge it to the
    Object.keys(payload).forEach((key) => (symbolicState[key] = payload[key]))
  }

  // Section: actions
  actions: any
  getActions = () => this.actions
  setActions = (after: any) => {
    if (after) {
      if (typeof after === 'function') {
        this.actions = after(this.symbolicState)
      } else {
        throw error('action-function')
      }
      // @ts-ignore
      this.symbolicState[configObject.actionsSymbol] = this.actions
    }
  }

  setAsRecord() {
    this.isRecord = true
  }

  /**
   * The following part is about the {setState} method.
   * {set} export is derived by using this.
   */

  setState: X.SetState<T> = (payload, produce) => {
    if (typeof payload === 'function') {
      // Easy usage of {immer.produce} or other similar functions
      const nextState: T | Promise<T> = produce
        ? produce(this.state, payload as (state: T) => T | Promise<T>)
        : (payload as (state: T) => T | Promise<T>)(this.state)
      if (
        // This condition determines if the payload is an async function, by duck typing
        nextState &&
        typeof (nextState as Promise<any>)?.then === 'function' &&
        typeof (nextState as Promise<any>)?.finally === 'function'
      ) {
        ;(nextState as Promise<T>).then((result: T) =>
          this.setStateInner(result)
        )
      } else {
        this.setStateInner(nextState as T)
      }
    } else {
      this.setStateInner(payload)
    }
  }

  setStateInner = (value: T) => {
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
  // Used by selector type stores
  private subscribedStores: any[] = []
  private selectorUnsubscriptions: (() => void)[] = []

  stateGetter: XGet = (item) => {
    const record = storeMap.get(item) || memberMap.get(item)
    const ownerStore = (record as any).internal
    if (!this.subscribedStores.includes(ownerStore)) {
      // TODO: some optimizations are possible here
      this.subscribedStores.push(ownerStore)
      const unsubscribe = ownerStore.subscribe(this.stateGetterListener)
      this.selectorUnsubscriptions.push(unsubscribe)
    }
    return get(item)
  }

  stateSetter: InitSet = (value: any, decorator) => {
    this.setState(value, decorator)
  }

  stateGetterListener: () => void = () => {
    const newState = this.initializer(this.stateGetter, this.stateSetter)
    // TODO: when sending this to setState, maybe shallow compare?
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
        throw error('internal-0')
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

  informTheParent = () => {
    if (!this.isRecord) {
      const match = parentMap.get(this.getSymbolicState())
      if (match) {
        const { internal } = storeMap.get(match.parent) as any
        setValueByAddress(
          internal.getNormalizedState(),
          match.address,
          this.normalizedState
        )
      }
    }
  }

  traverseState = () => {
    // generate copied one
    const [symbolic, normalized, children] = deepClone(this.state, this)
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
