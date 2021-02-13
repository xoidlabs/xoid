import { XGet, XSet, Initializer, After, Value, Store } from './types'
import { error } from './errors'
import {
  getData,
  getSubstores,
  getValueByAddress,
  isRootData,
  Key,
  override,
  transform,
} from './utils'
import { get, set } from '.'

// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand

type StateListener<T> = (state: T) => void
type Model = any

interface Options {
  model?: Model
}

export class Root<T, A> {
  private isSelector: boolean
  private initializer!: Initializer<T>
  private state: any
  private store: any
  substores: { address: string[]; root: Root<unknown, unknown> }[]
  model?: Model

  getStore: () => Store<T, A> = () => this.store

  constructor(
    init: T | Initializer<T>,
    after?: After<T, A>,
    options?: Options
  ) {
    // Determine if it's a selector, keep its initializer function
    this.isSelector = typeof init === 'function'
    if (this.isSelector) this.initializer = init as Initializer<T>
    // This one is for objectOf and arrayOf
    this.model = options?.model

    // Create the initial state
    this.state = this.isSelector
      ? shallowCopy(this.initializer(this.stateGetter, this.stateSetter))
      : shallowCopy(init as T)

    if (getData(this.state)) throw error('constructor')

    // Determine substore addresses
    this.substores = this.model ? [] : getSubstores(this.state)

    if (this.model) this.ensureStores()

    this.store = transform(
      {
        root: this,
        source: this as Record<string | number, unknown>,
        key: 'state',
      },
      false
    )

    this.setActions(after)
  }

  // Section: Actions
  private actions: any
  getActions = () => this.actions
  setActions = (after: any) => {
    if (typeof after !== 'undefined') {
      if (typeof after === 'function') this.actions = after(this.store)
      else throw error('action-function')
    }
  }

  // Section: subscribing to the store
  private listeners: Set<StateListener<T>> = new Set()
  subscribe = (listener: StateListener<T>) => {
    this.listeners.add(listener)
    return (() => this.listeners.delete(listener)) as () => void
  }

  // Used by selector type stores
  private cleanup: (() => void)[] = []
  stateSetter: XSet = (value) => set(this.store, value)
  stateGetter: XGet = (item?: any) => {
    if (typeof item === 'undefined') return get(this.store)
    const data = getData(item)
    const unsubscribe = data.root.subscribe(this.otherStateListener)
    this.cleanup.push(unsubscribe)
    return transform(data, true)
  }

  otherStateListener = () => {
    const newState = this.initializer(this.stateGetter, this.stateSetter)
    this.handleStateChange(this as Record<string, unknown>, 'state', newState)
  }

  ensureStores = () => {
    Object.keys(this.state).forEach((key) => {
      const value = this.state[key]
      const data = getData(value)
      if (!isRootData(data)) {
        this.state[key] = (this.model as Model)(value)
      }
    })
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
    if (
      object[key] === this.state &&
      typeof object[key] === 'object' &&
      object[key] !== null
    ) {
      override(object[key] as any, nextValue as any)
    } else {
      object[key] = nextValue
    }

    if (this.model) {
      this.ensureStores()
    } else {
      this.substores = this.substores.filter(({ address, root }) => {
        const [value, sourceExists] = getValueByAddress(this.state, address)
        if (sourceExists) {
          if (root.store !== value) {
            // TODO: is there cases where value is impure?
            set(root.store as Value<unknown>, value)
            const addressClone = [...address]
            const lastKey = addressClone.pop() as string
            getValueByAddress(this.state, addressClone)[0][lastKey] = root.store
          }
          return true
        } else {
          return false
        }
      })
    }

    const value = get(this.store)
    this.listeners.forEach((fn) => fn(value as T))
  }
}

const shallowCopy = (obj: any) => {
  if (typeof obj === 'object' && obj !== null)
    return Object.assign(new obj.constructor(), obj)
  else return obj
}
