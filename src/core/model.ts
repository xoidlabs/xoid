import { set } from '.'
import { Root } from './root'
import { StateOf, Store } from './types'

export type Model<State, Actions> = (
  state: StateOf<State>
) => Store<State, Actions>

export function objectOf<State, Actions>(
  model: Model<State, Actions>,
  init: Record<string, StateOf<State>> = {}
) {
  const root = new Root(
    init as Record<string, Store<State, Actions>>,
    (store) => ({
      add: (item: StateOf<State>, key: string) =>
        //@ts-ignore
        set(store, (state) => ({ ...state, [key]: item })),
      //
      remove: (key: string) => {
        // @ts-ignore
        set(store, (state) => {
          return Object.keys(state).reduce((result, ownKey) => {
            if (ownKey !== key) {
              result[ownKey] = state[ownKey]
            }
            return result
          }, {} as Record<string, Store<State, Actions>>)
        })
      },
    }),
    { model: model as Model<State, Actions> }
  )
  return root.getStore()
}

export function arrayOf<State, Actions>(
  model: Model<State, Actions>,
  init: StateOf<State>[] = []
) {
  const root = new Root(
    init as Store<State, Actions>[],
    (store) => ({
      //@ts-ignore
      add: (item: StateOf<State>) => set(store, (state) => [...state, item]),
      remove: (match: number | ((item: StateOf<State>) => boolean)) => {
        set(store, (state) => {
          if (typeof match === 'number') {
            return state.filter((item: any, index: number) => index !== match)
          } else {
            return state.filter((item: any) => !match(item))
          }
        })
      },
    }),
    { model: model as Model<State, Actions> }
  )
  return root.getStore()
}
