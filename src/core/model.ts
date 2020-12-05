// import { createStore } from './createStore'
import { create, set } from '.'
import { Store } from './types'
// import { InternalRecord, isStore, storeMap } from './utils'
// import { set } from './main'
// import { error } from './error'
// // IMPORTANT: fix types for model vs store types

// type ArrayBuiltins<K> = {
//   add: (item: K) => void
//   remove: (match: number | ((item: K) => boolean)) => void
// }

// type ObjectBuiltins<K> = {
//   add: (item: K, key: string) => void
//   remove: (key: string) => void
// }

// enum Types {
//   array,
//   object,
// }

// type ModelCreator = <T, A extends X.After<T, unknown>, K>(
//   init: (payload: K) => T,
//   actor?: A
// ) => {
//   // create function
//   (arg: K): Model<T, A, K>

//   // array
//   array<L extends Record<number, K | T> | K[] | T[], B>(
//     init: L,
//     actor: (store: X.Store<L, ArrayBuiltins<K>>) => B
//   ): X.Store<Model<T, A, K>[], B>
//   array<L extends Record<number, K | T> | K[] | T[]>(
//     init?: L
//   ): X.Store<Model<T, A, K>[], ArrayBuiltins<K>>

//   // object
//   object<L extends Record<string, K | T>, B>(
//     init: L,
//     actor: (store: X.Store<L, ObjectBuiltins<K>>) => B
//   ): X.Store<Model<T, A, K>[], B>
//   object<L extends Record<string, K | T>>(
//     init?: L
//   ): X.Store<Model<T, A, K>[], ObjectBuiltins<K>>
// }

// const recordCreator = (storeCreator: any, type?: Types) => <T, A>(
//   init: T,
//   actor?: A
// ) => {
//   if (init && typeof init !== 'object')
//     throw type === Types.array
//       ? error('array-creator')
//       : error('object-creator')

//   const value = ensureStores(init, storeCreator, type)
//   const builtins =
//     type === Types.array
//       ? (store: any) => ({
//           add: (item: any) => set(store, (state) => [...state, item]),
//           remove: (match: any) => {
//             set(store, (state) => {
//               if (typeof match === 'number') {
//                 return state.filter(
//                   (item: any, index: number) => index !== match
//                 )
//               } else {
//                 return state.filter((item: any) => !match(item))
//               }
//             })
//           },
//         })
//       : (store: any) => ({
//           add: (item: any, key: string) =>
//             set(store, (state) => ({ ...state, [key]: item })),
//           remove: (match: any) => {
//             set(store, (state) => {
//               return Object.keys(state).reduce((result, key) => {
//                 if (key !== match) {
//                   result[key] = state[key]
//                 }
//                 return result
//               }, {} as any)
//             })
//           },
//         })

//   const store = createStore(value)
//   // modify the set function of the store
//   const { internal } = storeMap.get(store) as InternalRecord
//   internal.setAsRecord()
//   internal.setActions(builtins)
//   internal.setActions(actor)

//   const oldSet = internal.setState
//   // override the set function with its special version
//   internal.setState = (value: any) => {
//     value = ensureStores(value, storeCreator, type)
//     oldSet(value)
//   }

//   return store
// }

// const ensureStores = (obj: any, storeCreator: any, type?: Types) => {
//   if (obj === undefined || obj === null) {
//     if (type === Types.array) {
//       return []
//     } else if (type === Types.object) {
//       return {}
//     } else {
//       return obj
//     }
//   }
//   const newObj: any = []
//   Object.keys(obj).forEach((key) => {
//     if (!isStore(obj[key])) {
//       newObj[key] = storeCreator(obj[key])
//     } else {
//       newObj[key] = obj[key]
//     }
//   })
//   return newObj
// }

// export function objectOf<Payload, State, Actions>(
//   model: (payload: Payload) => Store<State, Actions>
// ) {
//   const store = create(
//     {} as Record<string, Store<State, Actions>>,
//     (store) => ({
//       add: (item: Payload, key: string) =>
//         set(store, (state) => ({ ...state, [key]: model(item) })),
//       //
//       remove: (key: string) => {
//         set(store, (state) => {
//           return Object.keys(state).reduce((result, ownKey) => {
//             if (ownKey !== key) {
//               result[ownKey] = state[ownKey]
//             }
//             return result
//           }, {} as Record<string, Store<State, Actions>>)
//         })
//       },
//     })
//   )
//   return store
// }
