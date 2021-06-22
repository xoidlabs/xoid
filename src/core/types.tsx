import { create } from '.'

const store = Symbol()

// export type XGet = {
//   <T>(item: ValueRef<T>): Detransform<T>
//   (): unknown
// }
// export type XSet = <T>(value: T) => void
// export type Initializer<T> = (get: XGet, set: XSet) => T

// export type GetState = <T>(store: Value<T>) => T
// export type SetState = <T>(store: Value<T>, state: T | ((state: T) => T | Promise<T>)) => void

export type Unsub = () => void
export type Listener = () => void

// export type Store<T, A = undefined> = Transform<T> & ValueRef<T>

// export type ValueRef<T> = {
//   (): Detransform<T>
//   (value: Detransform<T>): void
//   (value: (value: Detransform<T>) => Detransform<T> | undefined): void
// }

// export type Transform<T> =
//   // forward existing ValueRefs
//   T extends ValueRef<any>
//     ? T
//     : T extends Function
//     ? ValueRef<T>
//     : T extends object
//     ? ValueRef<{ [P in keyof T]: Transform<T[P]> }>
//     : ValueRef<T>

// export type Detransform<T> = T extends ValueRef<infer K>
//   ? K extends object
//     ? { [P in keyof K]: Detransform<K[P]> } &
//         (K extends Function ? RemoveKeysFromFunction<K> : {})
//     : Detransform<K>
//   : T extends object
//   ? { [P in keyof T]: Detransform<T[P]> } &
//       (T extends Function ? RemoveKeysFromFunction<T> : {})
//   : T

type RemoveKeysFromFunction<T> = T extends (...args: infer A) => infer B
  ? (...args: A) => B
  : T extends () => infer B
  ? () => B
  : never

////////
export type Value<T> = {
  [store]: true
  (): Detransform<T>
  (value: Detransform<T>): void
  (value: (value: Detransform<T>) => Detransform<T> | undefined): void
}
export type Rec<T> = Value<T> & T
export type Store<T, A = undefined> = Transform<T> //& { [store]: A }

export type Transform<T> = T extends Value<any>
  ? T
  : T extends Function
  ? keyof T extends never
    ? Value<T>
    : Value<T> & TransformInner<T>
  : T extends object
  ? Rec<TransformInner<T>>
  : Value<T>

type TransformInner<T> = { [P in keyof T]: Transform<T[P]> }

export type Detransform<T> = T extends Value<infer P>
  ? DetransformInner<P>
  : DetransformInner<T>

export type DetransformInner<T> = T extends object
  ? { [P in keyof T]: Detransform<T[P]> } & (T extends Function ? T : {})
  : T

// const st = create({
//   alpha: create(3),
//   f: false,
//   beta: { thick: 'str', thighs: 666 },
//   log: (a: number) => 'string',
// })

// const state = st()

// const LOG = (a: number) => 'string'
// type Pro = Transform<typeof LOG>

// type PRIM = Detransform<Store<number>>

// const h = state.log(6)

class Counter {
  alpha = 3
  increment() {
    this.alpha = this.alpha + 1
    return 'anan'
  }
}
const instance = new Counter()
const box = create(instance)
const state = box()
const bit = state.increment
