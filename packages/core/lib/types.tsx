export type Listener<T> = (state: T) => void
export type State<T extends Store<any>> = T extends Store<infer P> ? P : never // TODO: remove?
export type GetState = <T>(store: Store<T>) => T
export type SetState<T> = (state: T | ((state: T) => T)) => void
export type Init<T> = T | ((get: GetState) => T)

export type Value<T> = {
  (): T
  (state: T): void
  (fn: (state: T) => T): void
}
export type Store<T> = Value<T> & (T extends object ? { [K in keyof T]: Store<T[K]> } : {})

export type Create = {
  <T extends any>(init: Init<T>, mutable?: boolean): Store<T>
  <T extends any>(): Store<T>
}
