// Helper symbols
const useable = Symbol('useable')
const action = Symbol('action')

// Main types
export type Useable<T> = { [useable]: T }
export type List<T> = Useable<T> & T
export type Store<T, A = unknown> = Transform<T> & { [action]: A }

// Actions
export type ActorCallback<T, A> = (store: Store<T, A>) => A
export type ActorObject<T, A> = Record<string | number, ActorCallback<T, A>>
export type Actor<T, A> = ActorCallback<T, A> | ActorObject<T, A>

// Transform store into shape
export type Transform<T> = T extends
  | null
  | undefined
  | number
  | string
  | boolean
  | Function
  ? Useable<T>
  : T extends Useable<any>
  ? T
  : T extends Record<any, any>
  ? List<{ [P in keyof T]: Transform<T[P]> }>
  : never

// Transform shape into state tree
export type GetStoreState<T> = T extends Useable<infer K>
  ? K extends Function
    ? K
    : {
        [P in keyof K]: GetStoreState<K[P]>
      }
  : T

// Transform actions into their executed versions
export type GetStoreActions<T, G> = G extends ActorCallback<T, infer A>
  ? A
  : G extends ActorObject<T, any>
  ? { [P in keyof G]: G[P] extends ActorCallback<T, infer A> ? A : never }
  : never
