import { Create, Listener, Store } from "./types"

export type Meta = {
  parentMeta?: Meta
  node: any
  cache: Record<string, any>
  key?: string
  shape?: any
  root: ReturnType<typeof createRoot>
}

//@ts-ignore
export const RECORD = window.__XOID_SYMBOLS__ ? window.__XOID_SYMBOLS__.record : Symbol()
//@ts-ignore
export const META = window.__XOID_SYMBOLS__ ? window.__XOID_SYMBOLS__.meta : Symbol()
//@ts-ignore
if(!window.__XOID_SYMBOLS__) window.__XOID_SYMBOLS__ = { record: RECORD, meta: META }

export const createCell = (parentMeta: Meta, key: string): any => {
  const node = parentMeta.node[key]
  if (node && node[META]) return node
  if (parentMeta.cache[key]) return parentMeta.cache[key]

  const meta = {
    parentMeta,
    key,
    get node() {
      return parentMeta.node[key]
    },
    set node(value) {
      if (meta.root.mutable) {
        parentMeta.node[key] = value
        return
      }
      const copy = generateNew(parentMeta.node)
      copy[key] = value
      parentMeta.node = copy
    },
    cache: {},
    root: parentMeta.root,
    shape: parentMeta.shape && (parentMeta.shape[RECORD] || parentMeta.shape[key]),
  } as Meta

  const proxy: any = new Proxy(createTarget(meta), {
    get(_, prop: string | symbol) {
      if (prop === META) return meta

      // start: prototype stuff
      const node = meta.node
      if ((prop as symbol) === Symbol.toPrimitive) return () => node
      if (!Object.prototype.hasOwnProperty.call(node, prop)) {
        if (node[prop]) {
          return node[prop].bind
            ? node[prop].bind(createCell(meta.parentMeta as Meta, meta.key as string))
            : node[prop]
        }
      }
      // end: prototype stuff

      return createCell(meta, prop as string)
    },
    set() {
      return false
    },
    has(_, key) {
      return key in meta.node
    },
    ownKeys() {
      return Reflect.ownKeys(meta.node)
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  })
  parentMeta.cache[key] = proxy
  return proxy
}

const generateNew = (obj: any) => Object.assign(Array.isArray(obj) ? [] : Object.create(obj), obj)

export const createTarget = (meta: Meta) => {
  return function (input?: any) {
    if (arguments.length === 0) return meta.node
    const newValue = typeof input === 'function' ? input(meta.node) : input
    if (meta.node === newValue) return
    meta.node = newValue
    meta.root.notify()
  }
}

export const createRoot = (mutable?: boolean) => {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return { listeners, notify, subscribe, mutable }
}

export const createInstance = (shape?: any): Create => (init?: any, mutable?: any) => {
  const isFunction = typeof init === 'function'
  const root = createRoot(mutable)
  const store = createCell(
    {
      node: { value: isFunction ? null : init },
      cache: {},
      root,
      shape: { value: shape },
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
      return store((init as Function)(getter))
    }
    updateState()
  }
  return store
}

/**
 * Subscribes to a store, or a partial store.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

 export const subscribe = <T extends any>(store: Store<T>, fn: Listener<T>): (() => void) => {
  let prevValue = store()
  return ((store as any)[META] as Meta).root.subscribe(() => {
    const nextValue = store()
    if (nextValue !== prevValue) fn(nextValue as any)
    prevValue = nextValue
  })
}
