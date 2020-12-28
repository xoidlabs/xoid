const store = Symbol('store')
const value = Symbol('value')

export type XGet = {
  <T>(item: Value<T>): StateOf<T>
  (): unknown
}
export type XSet = <T>(value: T, decorator?: Decorator<T>) => void
export type Initializer<T> = (get: XGet, set: XSet) => T

export type GetState = <T>(store: Value<T>) => T
export type SetState = <T>(
  store: Value<T>,
  state: T | ((state: T) => T | Promise<T>),
  decorator?: Decorator<T>
) => void

export type Decorator<T> = (state: T, fn?: (draft: T) => T) => T

export type Store<T, A = undefined> = Transform<T> & {
  [store]: A
}
export type Value<T> = {
  [value]: T
}
export type Rec<T> = Value<T> & T

export type After<State, Actions = undefined> = (
  store: Store<State>,
  destroy: () => void
) => Actions

export type Transform<T> = T extends Value<any>
  ? T
  : T extends Function
  ? Value<T>
  : T extends object
  ? Rec<{ [P in keyof T]: Transform<T[P]> }>
  : Value<T extends true | false ? boolean : T>

export type StateOf<T> = T extends Value<infer K>
  ? K extends Function
    ? K
    : K extends object
    ? { [P in keyof K]: StateOf<K[P]> }
    : K
  : T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]: StateOf<T[P]> }
  : T
