import {
  deepClone,
  getValueByAddress,
  memberMap,
  parentMap,
  setValueByAddress,
  storeMap,
} from './utils'
import { X, XGet, InitSet, Initializer } from './types'
import { get } from './main'
import { error } from './error'
import { configObject } from './config'
import {
  Address,
  getData,
  setData,
  transform,
  XNodeData,
  XNodeData$,
} from './transform'
import { set } from './createStore'

// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand
type Symbolic__ = any

export type SetState<T> = (
  state: T | ((state: T) => T),
  decorator?: X.Decorator<T>,
  address?: Address
) => void

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

export class Root<T, A> {
  private isSelector: boolean
  private initializer!: Initializer<T>

  getParent(): any {}
  setParent(root: Root<any, any>, address: Address) {}

  children?: Set<XNodeData$>
  setChildren = (children: Set<any>) => (this.children = children)

  //
  private store: any
  getStore = () => this.store

  //
  private value: T
  getValue = (address: Address) => getValueByAddress(this.value, address)[0]

  private childSubscriptions: (() => void)[] = []

  constructor(init: T | Initializer<T>, after?: X.After<T, A>) {
    // Determine if it's a selector, record its initializer
    this.isSelector = typeof init === 'function'
    if (this.isSelector) this.initializer = init as Initializer<T>

    // Create the initial state
    this.value = this.isSelector
      ? this.initializer(this.stateGetter, this.stateSetter)
      : (init as T)

    // Obtain {store}
    ;[this.store, this.value] = transform(this.value, this, [])
    this.setActions(after)
  }

  // Section: Actions
  private actions: any
  getActions = () => this.actions
  setActions = (after: any) => {
    if (after) {
      if (typeof after === 'function') this.actions = after(this.store)
      else throw error('action-function')
      // @ts-ignore
      this.store[configObject.actionsSymbol] = this.actions
    }
  }

  setState: SetState<T> = (payload, decorator, address = []) => {
    const prevValue: T = this.getValue(address)

    if (typeof payload === 'function') {
      // Easy usage of {immer.produce} or other similar functions
      const nextValue: T | Promise<T> = decorator
        ? decorator(prevValue, payload as (state: T) => T | Promise<T>)
        : (payload as (state: T) => T | Promise<T>)(prevValue)

      if (
        // This condition determines if the payload is an async function, by duck typing
        nextValue &&
        typeof (nextValue as Promise<any>)?.then === 'function' &&
        typeof (nextValue as Promise<any>)?.finally === 'function'
      ) {
        ;(nextValue as Promise<T>).then((promiseResult: T) =>
          this.setStateInner(prevValue, promiseResult, address)
        )
      } else {
        this.setStateInner(prevValue, nextValue as T, address)
      }
    } else {
      this.setStateInner(prevValue, payload, address)
    }
  }

  setStateInner = (prevValue: T, nextValue: T, address: Address) => {
    if (nextValue === prevValue) return
    if (address.length) {
      // TODO: clone the object up to the point where subtree stays
      const newValue = { ...this.value }
      setValueByAddress(newValue, address, nextValue)
      this.setStateInner(this.value, newValue, [])
    } else {
      // If there's child stores already, let them do the traversing
      if (this.children && this.children.size) {
        this.children.forEach((item) => {
          const [branch, branchExists] = getValueByAddress(
            nextValue,
            item.address
          )
          if (branchExists) {
            const childRoot = item.root
            setValueByAddress(nextValue, item.address, childRoot.getStore())
            childRoot.setStateInner(childRoot.value, branch, [])
          }
        })
      }
      // Set {store} and {value} trees
      const result = transform(nextValue, this, address)
      override(this.store, result[0])
      this.value = result[1]
      // Also don't lose these two
      setData(this.store, { root: this, address: [], value: this.value })
      this.store[configObject.actionsSymbol] = this.actions
    }
  }

  // Section: For {createModel} to modify internals
  private isRecord: boolean = false
  setAsRecord() {
    this.isRecord = true
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

  //Section: subscribing to the store.
  //The logic is kept almost identical with zustand's logic.
  //There's additional {shallowSubscribe} method that's used internally.

  private listeners: Set<StateListener<T>> = new Set()
  private shallowListeners: Set<StateListener<T>> = new Set()

  subscribeWithSelector = <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice>
  ) => {
    const listenerToAdd = () => {
      // Selector could throw but we don't want to stop the listener from
      // being called. https://github.com/react-spring/zustand/pull/37
      try {
        const newStateSlice = selector(this.value)
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
    this.listeners.forEach((listener) => listener(this.value))
  }

  traverseState = () => {
    // generate copied one
    const [symbolic, normalized, children] = deepClone(this.value, this)
    // set new normalizedState and store
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

const override = (
  target: Record<string, unknown>,
  payload: Record<string, unknown>
) => {
  // delete all keys
  Object.keys(target).forEach((key) => delete target[key])
  // shallowmerge it to the object
  Object.keys(payload).forEach((key) => (target[key] = payload[key]))
}
