import { deepClone, parentMap, storeMap } from './utils'
import { StoreInternalAPI } from './createStore'
import { Store, ReverseTransform } from './types'
import { subscribe as subscribeXoid, get as getXoid } from './xoid'
// zustand is used as a starting point to this file
// https://github.com/react-spring/zustand

export type State = any
export type API = any
export type Initializer<T> = (get: GetOtherState) => T
export type Settings = string
export type StateSelector<T extends State, U> = (state: T) => U
export type EqualityChecker<T> = (state: T, newState: unknown) => boolean
export type StateListener<T> = (state: T) => void
export type StateSliceListener<T> = (state: T | null, error?: Error) => void
export type GetOtherState = <T>(store: T) => ReverseTransform<T>

export type SetState<T extends State> = (
  value: T | ((state: T) => T),
  decorator?: (state: T, callback: (draft: T) => T | void) => void
) => void

export type GetState<T extends State> = () => T

export type Destroy = () => void
export interface Subscribe<T extends State> {
  (listener: StateListener<T>): () => void
  <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice>,
    equalityFn?: EqualityChecker<StateSlice>
  ): () => void
}

export type ShallowSubscribe<T extends State> = (
  listener: StateListener<T>
) => void

export type GetMutableCopy<T> = () => Store<T, any>

export function baseStore<T extends State>(
  stateCreator: T | Initializer<T>,
  settings?: Settings
) {
  const listeners: Set<StateListener<T>> = new Set()
  const shallowListeners: Set<StateListener<T>> = new Set()
  const listening: any[] = []
  const unsubs: (() => void)[] = []

  const set: SetState<T> = (value: any, produce?: any) => {
    if (typeof value === 'function') {
      // Easy usage of {immer.produce} or other decorator-like functions
      const nextState = produce ? produce(state, value) : value(state)
      setPlainState(nextState)
    } else if (
      value &&
      typeof (value as Promise<any>)?.then === 'function' &&
      typeof (value as Promise<any>)?.finally === 'function'
    ) {
      value.then((result: T) => {
        setPlainState(result)
      })
    } else {
      setPlainState(value)
    }
  }

  const setPlainState = (value: T, merge?: boolean) => {
    if (value !== state) {
      state = value as T
      setMutableCopy()
      forceUpdate()
    }
  }

  const forceUpdate = () => {
    listeners.forEach((listener) => {
      listener(state)
    })
    shallowListeners.forEach((listener) => {
      listener(state)
    })
    informTheParent()
  }

  const childUpdate = () => {
    listeners.forEach((listener) => {
      listener(state)
    })
    // informTheParent()
  }

  const updateValueOnAddress = (
    root: object,
    address: string[],
    newValue: any
  ) => {
    if (address.length) {
      address.reduce((acc: any, key: any, i: number) => {
        if (i === address.length - 1) acc[key] = newValue
        return acc[key]
      }, root)
    } else {
      // TODO: this must be unreachable?
      console.error('TODO: this must be unreachable?')
      Object.assign(root, newValue)
    }
  }

  const informTheParent = () => {
    const match = parentMap.get(getMutableCopy())
    if (match) {
      const { internal } = storeMap.get(match.parent)

      updateValueOnAddress(internal.getState(), match.address, n)
    }
  }

  const get: GetState<T> = () => state

  const subscribeWithSelector = <StateSlice>(
    listener: StateSliceListener<StateSlice>,
    selector: StateSelector<T, StateSlice> = get as any
  ) => {
    function listenerToAdd() {
      // Selector could throw but we don't want to stop the listener from
      // being called. https://github.com/react-spring/zustand/pull/37
      try {
        const newStateSlice = selector(state)
        listener(newStateSlice)
      } catch (error) {
        listener(null, error)
      }
    }
    listeners.add(listenerToAdd)
    // Unsubscribe
    return () => listeners.delete(listenerToAdd)
  }

  const subscribe: Subscribe<T> = <StateSlice>(
    listener: StateListener<T> | StateSliceListener<StateSlice>,
    selector?: StateSelector<T, StateSlice>,
    equalityFn?: EqualityChecker<StateSlice>
  ) => {
    if (selector || equalityFn) {
      return subscribeWithSelector(
        listener as StateSliceListener<StateSlice>,
        selector
      )
    }
    listeners.add(listener as StateListener<T>)
    // Unsubscribe
    return () => listeners.delete(listener as StateListener<T>)
  }

  const shallowSubscribe: ShallowSubscribe<T> = (listener) => {
    shallowListeners.add(listener as StateListener<T>)
    // Unsubscribe
    return () => shallowListeners.delete(listener as StateListener<T>)
  }

  const destroy: Destroy = () => {
    listeners.clear()
    unsubs.forEach((fn) => fn())
  }

  const listener: () => void = () => {
    const newState = (stateCreator as Initializer<T>)(getOtherState)
    set(newState)
  }

  const getOtherState: GetOtherState = (item) => {
    if (!listening.includes(item)) {
      const unsub = subscribeXoid(item, listener)
      listening.push(item)
      unsubs.push(unsub)
    }
    return getXoid(item)
  }

  let state: T =
    typeof stateCreator === 'function'
      ? (stateCreator as Initializer<T>)(getOtherState)
      : (stateCreator as T)

  let childSubscriptions: (() => void)[] = []

  const mutableCopy = Array.isArray(state) ? [] : ({} as any)
  const getMutableCopy: GetMutableCopy<T> = () => mutableCopy
  const setMutableCopy = () => {
    // delete all keys
    Object.keys(mutableCopy).forEach((key) => delete mutableCopy[key])
    // generate copied one
    const [copied, normal, childStores] = deepClone(
      state,
      store as StoreInternalAPI<T>
    )
    n = normal
    // remove prev child subs
    childSubscriptions.forEach((fn) => fn())
    // add new
    childSubscriptions = [...childStores].map((item) => {
      return item.internal.shallowSubscribe(childUpdate)
    })
    // shallowmerge it easily
    Object.keys(copied).forEach((key) => (mutableCopy[key] = copied[key]))
  }

  let n: any
  const getState = () => n

  const store: Omit<StoreInternalAPI<T>, 'getActions'> = {
    get,
    getState,
    set,
    destroy,
    subscribe,
    shallowSubscribe,
    getMutableCopy,
    forceUpdate,
  }

  setMutableCopy()
  return store
}
