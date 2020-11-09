// Helper symbols
const store = Symbol('store')
const value = Symbol('value')
const model = Symbol('model')

// Main types
export type Store<T, A = undefined> = Transform<T> & { [store]: A }
export type Abstract<T> = { [value]: T }
export type List<T> = Abstract<T> & T
export type Model<T, A extends Actor<T, any>, K> = Store<T, ReturnType<A>> & {
  [model]: K
}
// TODO: rename this
export type Actor<T, A> = (store: Store<T, A>) => A

export type XGet = <T extends Abstract<any>>(store: T) => GetStoreState<T>
export type InitSet = <T>(value: T, decorator?: any) => void
export type Initializer<T> = (get: XGet, set: InitSet) => T
export type After<State, Actions = undefined> = (store: Store<State>) => Actions

// Transform store into shape
export type Transform<T> = T extends
  | null
  | undefined
  | number
  | string
  | boolean
  | Function
  ? Abstract<T>
  : T extends Abstract<any>
  ? T
  : T extends Record<any, any>
  ? List<{ [P in keyof T]: Transform<T[P]> }>
  : never

// Transform shape into state tree
export type GetStoreState<T> = T extends Abstract<infer K>
  ? K extends Function
    ? K
    : {
        [P in keyof K]: GetStoreState<K[P]>
      }
  : T
