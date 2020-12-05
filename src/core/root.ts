import { XGet, XSet, Initializer, After } from './types'
import { error } from './errors'
import { getData, Key, pure, transform } from './utils'
import { get, set } from '.'

// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand

export type StateListener<T> = (state: T) => void

export class Root<T, A> {
  private isSelector: boolean
  private initializer!: Initializer<T>
  private state: any
  private store: any

  getStore = () => this.store

  constructor(init: T | Initializer<T>, after?: After<T, A>) {
    // Determine if it's a selector, record its initializer
    this.isSelector = typeof init === 'function'
    if (this.isSelector) this.initializer = init as Initializer<T>

    // Create the initial state
    this.state = this.isSelector
      ? this.initializer(this.stateGetter, this.stateSetter)
      : (init as T)

    this.store = transform(
      this,
      this as Record<string | number, unknown>,
      'state',
      false
    )

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
  private cleanup: (() => void)[] = []
  stateSetter: XSet = (value, decorator) => set(this.store, value, decorator)
  stateGetter: XGet<T> = (item?: any) => {
    if (typeof item === 'undefined') return get(this.store)
    const data = getData(item)
    const unsubscribe = data.root.subscribe(this.otherStateListener)
    this.cleanup.push(unsubscribe)
    return pure(data)
  }

  otherStateListener = () => {
    const newState = this.initializer(this.stateGetter, this.stateSetter)
    this.handleStateChange(this as Record<string, unknown>, 'state', newState)
  }

  destroy = () => {
    this.listeners.clear()
    this.cleanup.forEach((fn) => fn())
  }

  // Section: Firing listeners after state changes
  handleStateChange = (
    object: Record<Key, unknown>,
    key: Key,
    nextValue: T
  ) => {
    if (object[key] === nextValue) return
    // before assigning the next value, rehydrate already existing addresses.
    nextValue, this.subStores
    object[key] = nextValue

    this.listeners.forEach((fn) => fn(this.value))
  }
}
