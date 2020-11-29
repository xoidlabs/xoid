import { XGet, XSet, Initializer, After } from './types'
import { error } from './errors'
import {
  createSetter,
  createTrap,
  getData,
  Key,
  storeHandler,
  valueHandler,
} from './utils'

// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand

export type StateListener<T> = (state: T) => void

export class Root<T, A> {
  private isSelector: boolean
  private initializer!: Initializer<T>

  value: any
  state: any
  private store: any
  getStore = () => this.store

  getParent(): any {}
  setParent(root: Root<any, any>) {}

  constructor(init: T | Initializer<T>, after?: After<T, A>) {
    // Determine if it's a selector, record its initializer
    this.isSelector = typeof init === 'function'
    if (this.isSelector) this.initializer = init as Initializer<T>

    // Create the initial state
    this.state = this.isSelector
      ? this.initializer(this.stateGetter, this.stateSetter)
      : (init as T)

    this.store = createTrap(this, storeHandler)
    this.value = createTrap(this, valueHandler)
    this.setActions(after)
  }

  // Section: Actions
  private actions: any
  getActions = () => this.actions
  setActions = (after: any) => {
    if (after) {
      if (typeof after === 'function') this.actions = after(this.store)
      else throw error('action-function')
    }
  }

  // Section: subscribing to the store
  private listeners: Set<StateListener<T>> = new Set()
  subscribe = (listener: StateListener<T>) => {
    this.listeners.add(listener as StateListener<T>)
    return (() =>
      this.listeners.delete(listener as StateListener<T>)) as () => void
  }

  // Used by selector type stores
  private cleanupEffects: (() => void)[] = []
  stateSetter: XSet = createSetter(this, this, 'state')
  stateGetter: XGet<T> = (item?: any) => {
    if (typeof item === 'undefined') return this.value
    const data = getData(item)
    const unsubscribe = data.root.subscribe(this.otherStateListener)
    this.cleanupEffects.push(unsubscribe)
    return data.getValue()
  }

  otherStateListener = () => {
    const newState = this.initializer(this.stateGetter, this.stateSetter)
    this.handleStateChange(this as Record<string, unknown>, 'state', newState)
  }

  destroy = () => {
    this.listeners.clear()
    this.cleanupEffects.forEach((fn) => fn())
  }

  // Section: Firing listeners after state changes
  handleStateChange = (
    object: Record<Key, unknown>,
    key: Key,
    nextValue: T
  ) => {
    if (object[key] === nextValue) return
    object[key] = nextValue
    this.listeners.forEach((fn) => fn(this.value))
  }
}
