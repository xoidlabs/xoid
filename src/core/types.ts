// Helper symbols
const observable = Symbol('observable')
const action = Symbol('action')

// Main types
export type Observable<T> = { [observable]: T }
export type List<T> = Observable<T> & T
export type Store<T, A = unknown> = Transform<T> & { [action]: A }

// Actions
export type ActorCallback<T, A> = (store: Store<T, A>) => A
export type ActorObject<T, A> = Record<string | number, ActorCallback<T, A>>
export type Actor<T, A> = ActorCallback<T, A> | ActorObject<T, A>

// Transform store into shape
export type Transform<T> = T extends number | string | boolean
  ? Observable<T>
  : T extends Observable<any>
  ? T
  : T extends Record<any, any>
  ? List<{ [P in keyof T]: Transform<T[P]> }>
  : never

// Transform shape into state tree
export type ReverseTransform<T> = T extends List<infer B>
  ? B
  : T extends Observable<infer K>
  ? K extends number | string | boolean
    ? K
    : K extends List<any>
    ? {
        [P in keyof Omit<
          T,
          typeof observable | typeof action
        >]: ReverseTransform<T[P]>
      }
    : never
  : never

// Transform actions into their executed versions
export type TransformToActions<T, G> = G extends ActorCallback<T, infer A>
  ? A
  : G extends ActorObject<T, any>
  ? { [P in keyof G]: G[P] extends ActorCallback<T, infer A> ? A : never }
  : never
