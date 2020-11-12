const store = Symbol('store')
const value = Symbol('value')
const model = Symbol('model')

export namespace X {
  export type GetState<T> = () => T
  export type SetState<T> = (
    state: T | ((state: T) => T),
    decorator?: Decorator<T>
  ) => void
  export type Decorator<T> = (
    state: T,
    fn?: (draft: T) => T | Promise<T>
  ) => T | Promise<T>

  export type Store<T, A = undefined> = Transform<T> & {
    [store]: A
  }
  export type Value<T> = {
    [value]: T
  }
  export type Rec<T> = X.Value<T> & T

  export type After<State, Actions = undefined> = (
    store: X.Store<State>
  ) => Actions
}

/* eslint-disable prettier/prettier */
export type Transform<T> = T extends X.Value<any>
  ? T
  : T extends Function
  ? X.Value<T>
  : T extends object
  ? X.Rec<{ [P in keyof T]: Transform<T[P]> }>
  : X.Value<T extends true | false ? boolean : T>
/* eslint-enable prettier/prettier */

// Main types
export type Model<T, A extends Actor<T, any>, K> = X.Store<T, ReturnType<A>> & {
  [model]: K
}
// TODO: rename this
export type Actor<T, A> = (store: X.Store<T, A>) => A

export type XGet = <T extends X.Value<any>>(store: T) => GetStoreState<T>

// Delet this
export type InitSet = <T>(value: T, decorator?: any) => void
// make the second one store
export type Initializer<T> = (get: XGet, set: InitSet) => T

// Transform shape into state tree
// TODO: rename this to Normalized
export type GetStoreState<T> = T extends X.Value<infer K>
  ? K extends Function
    ? K
    : {
        [P in keyof K]: GetStoreState<K[P]>
      }
  : T
