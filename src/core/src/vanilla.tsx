import { Store, Create, Listener } from './types'
import { createRoot, createCell, META, Meta } from './utils'

/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export const create: Create = (init, mutable) => {
  const isFunction = typeof init === 'function'
  const root = createRoot(mutable)
  const obj = createCell(
    {
      node: { value: isFunction ? null : init },
      cache: {},
      root,
    },
    'value'
  )
  if (isFunction) {
    const unsubs = new Set<() => void>()
    const getter = (store: Store<any>) => {
      unsubs.add(subscribe(store, updateState))
      return store()
    }
    const updateState = () => {
      unsubs.forEach((fn) => fn())
      unsubs.clear()
      const result = (init as Function)(getter)
      return obj(result)
    }
    updateState()
  }
  return obj
}

/**
 * Subscribes to a store, or a partial store.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

export const subscribe = <T extends any>(
  store: Store<T>,
  fn: Listener<T>
): (() => void) => {
  let prevValue = store()
  return ((store as any)[META] as Meta).root.subscribe(() => {
    const nextValue = store()
    if (nextValue !== prevValue) fn(nextValue as any)
    prevValue = nextValue
  })
}

// export const ref = <T extends any>(init: T): Store<T> => {
//   const meta = { root: createRoot(), node: init } as Meta
//   const obj = Object.assign(createTarget(meta), { [META]: meta })
//   return obj as any
// }
