//@ts-nocheck
import { createSelector, createRoot, createTarget, META, RECORD, Observable } from '@xoid/engine'
//@ts-check

type Meta = {
  parentMeta?: Meta
  node: any
  cache: Record<string, any>
  key?: string
  address?: string[]
  shape?: any
  root: ReturnType<typeof createRoot> & {
    mutable?: boolean
    onSet?: (meta: any, value: any) => void
  }
}

export const createCell = (parentMeta: Meta, key: string) => {
  if (Object.prototype.hasOwnProperty.call(parentMeta.cache, key)) return parentMeta.cache[key]
  const root = parentMeta.root
  const shape = parentMeta.shape && (parentMeta.shape[key] || parentMeta.shape[RECORD])
  const address = [...(parentMeta.address || []), key]

  const meta = {
    parentMeta,
    root,
    key,
    address,
    get node() {
      return parentMeta.node[key]
    },
    set node(value) {
      if (root.mutable) {
        parentMeta.node[key] = value
      } else {
        const copy = shallowClone(parentMeta.node)
        copy[key] = value
        parentMeta.node = copy
      }
    },
    cache: {},
    shape,
  } as Meta

  const target = createTarget(meta, root.onSet)
  const proxy: any = new Proxy(target, {
    get(_, prop: string | symbol) {
      if (prop === META) return meta
      // start: prototype stuff
      const node = meta.node
      if ((prop as symbol) === Symbol.toPrimitive) return () => node

      if (
        !Object.prototype.hasOwnProperty.call(node, prop) &&
        Array.isArray(node) &&
        Object.prototype.hasOwnProperty.call(Array.prototype, prop)
      ) {
        throw Error("Array prototype methods shouldn't be used with xoid stores")
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
    ownKeys(t) {
      let keys = Reflect.ownKeys(meta.node)
      keys = keys.concat(Reflect.ownKeys(t))
      return Array.from(new Set(keys))
    },
    getOwnPropertyDescriptor(t, k) {
      if (Reflect.ownKeys(t).includes(k)) return Reflect.getOwnPropertyDescriptor(t, k)
      return Reflect.getOwnPropertyDescriptor(meta.node, k)
    },
  })
  parentMeta.cache[key] = proxy
  return proxy
}

export const createInstance = (options: { shape?: any; onSet?: (value: any) => void } = {}): any =>
  function (init?: any, mutable?: any) {
    const { shape, onSet } = options
    const isFunction = typeof init === 'function'
    if (!arguments.length) mutable = true
    const root = createRoot()
    const store = createCell(
      {
        node: { value: init },
        shape: { value: shape },
        cache: {},
        root: { ...root, mutable, onSet },
      },
      'value'
    )
    if (isFunction) createSelector(store, init)
    return store
  }

const shallowClone = (obj: any) =>
  Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

export const debug = (store: Observable<any>): Meta => (store as any)[META]
