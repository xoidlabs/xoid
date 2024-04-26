// an atom that can
type Action = any
type Reducer<T> = (state: T, action: Action) => T

const pluginReducer = <T>(options: { reducer?: Reducer<T> }) => {
  const { reducer } = options
  return {
    dispatch(action: Action) {
      this.update((s) => reducer(s, action))
    },
  }
}

const pluginProduce = <T>(options: {}) => {
  return {
    produce(fn: (draft: T) => void) {
      this.update((s) => produce(s, fn))
    },
  }
}

const pluginLocalStorage = (atom: any, options: { localStorageKey?: string }) => {
  const { localStorageKey } = options
  if (!localStorageKey) return

  const get = (init) => {
    const maybeItem = localStorage.getItem(localStorageKey)
    if (maybeItem) return JSON.parse(maybeItem)
    return init
  }
  const set = (state) => localStorage.setItem(localStorageKey, JSON.stringify(state))
  atom.middleware({ get, set })
}

type ReduxLikeStore<T> = {
  getState: () => T
  dispatch: (action: any) => void
  subscribe: () => () => void
}

const pluginRedux = (options: { reduxStore: ReduxLikeStore<unknown>; reduxActionType: string }) => {
  const { reduxStore, reduxActionType } = options
  if (!reduxStore) return

  atom.middleware({
    get: reduxStore.getState,
    set: (s) => reduxStore.dispatch({ type: reduxActionType, payload: s }),
    subscribe: reduxStore.subscribe,
  })
}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type Composable = (context: any, options?: any) => any
type GetOptions<T> = T extends (a: any, b: infer P) => any ? P : {}
type GetExtensions<T> = T extends (a: any, b: any) => infer P ? P : never

export type Truthy<T> = Exclude<T, false | 0 | '' | null | undefined>

const create = <T, P extends Composable>(i, plugins: P[]) => {
  type Options = UnionToIntersection<GetOptions<P>>
  type Extensions = UnionToIntersection<GetExtensions<P>>
  return <T>(init: T, options?: Options) => {
    const atom = create(init, options)
    plugins.forEach((fn) => fn(atom, options))
    return atom as Extensions
  }
}

const createWithReducer = <T>(value: T) => create(value, [pluginProduce<T>, pluginReducer])

declare const bind: <T, P>(options: {
  plugins: (type?: T) => P[]
}) => (value: T) => GetExtensions<P>

const atomWithReducer = bind({
  plugins: <T>() => [pluginProduce<T>, pluginReducer],
})

const a = atomWithReducer({ anan: 4 })

const newCreate = middleware({
  plugins: (value) => [pluginProduce<typeof value>, pluginReducer],
})
//

// TODO: This is nice, but doesn't tell anything in terms of options in the second argument.
// To truly build a plugin system, we need that too.
const extend = <T, P>(object: T, plugins: P[]) => {
  for (const item of plugins) {
    const descriptors = Object.getOwnPropertyDescriptors(item)
    Object.defineProperties(object, descriptors)
  }
  return object as T & P
}

// Attempt to have options
// It cannot be purely merge/assign based!
const extend2 =
  <T, O, P extends (options: any) => any>(plugins: P[], createObject: (options: O) => T) =>
  (options: Parameters<O>[0]) => {
    const object = createObject(options)
    for (const item of plugins) {
      const descriptors = Object.getOwnPropertyDescriptors(item(options))
      Object.defineProperties(object, descriptors)
    }
    return object as T & ReturnType<P>
  }
