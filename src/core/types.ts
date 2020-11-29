const store = Symbol('store')
const value = Symbol('value')
const model = Symbol('model')

export type XGet<Self> = {
  <T>(store: Value<T>): T
  (): Self
}
export type XSet = <T>(value: T, decorator?: Decorator<T>) => void
export type Initializer<T> = (get: XGet<T>, set: XSet) => T

export type GetState = <T>(store: Value<T>) => T
export type SetState = <T>(
  store: Value<T>,
  state: T | ((state: T) => T | Promise<T>),
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
export type Rec<T> = Value<T> & T

export type After<State, Actions = undefined> = (store: Store<State>) => Actions

export type Transform<T> = T extends Value<any>
  ? T
  : T extends Function
  ? Value<T>
  : T extends object
  ? Rec<{ [P in keyof T]: Transform<T[P]> }>
  : Value<T extends true | false ? boolean : T>

// Main types
export type Model<T, A extends Actor<T, any>, K> = Store<T, ReturnType<A>> & {
  [model]: K
}

// TODO: rename this
export type Actor<T, A> = (store: Store<T, A>) => A

// export type StateOf<T> = T extends Value<infer K>
//   ? K extends Function
//     ? K
//     : {
//         [P in keyof K]: GetStoreState<K[P]>
//       }
//   : T
