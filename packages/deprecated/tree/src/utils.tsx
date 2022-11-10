import { createTarget, createNotifier, META, RECORD, Atom } from '@xoid/engine'

type Meta = {
  parentMeta?: Meta
  node: any
  cache: Record<string, any>
  key?: string
  address?: string[]
  shape?: any
  root: ReturnType<typeof createNotifier>
}

export const createCell = (pm: Meta, key: string) => {
  // `pm` stands for `parentMeta`
  if (Object.prototype.hasOwnProperty.call(pm.cache, key)) return pm.cache[key]
  const root = pm.root
  const shape = pm.shape && (pm.shape[key] || pm.shape[RECORD])
  const address = pm.address ? pm.address.map((s) => s) : ([] as string[])

  const meta = {
    parentMeta: pm,
    root,
    key,
    address,
    get node() {
      return pm.node[key]
    },
    set node(value) {
      const copy = shallowClone(pm.node)
      copy[key] = value
      pm.node = copy
    },
    cache: {},
    shape,
  } as Meta

  const target = createTarget(
    () => meta.node,
    (value: any) => void (meta.node = value)
  )
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
  pm.cache[key] = proxy
  return proxy
}

export const createInstance = (options: { shape?: any } = {}): any =>
  function (init?: any) {
    const { shape } = options
    const root = createNotifier()
    const store = createCell(
      {
        node: { value: init },
        shape: { value: shape },
        cache: {},
        root,
      },
      'value'
    )
    return store
  }

const shallowClone = (obj: any) =>
  Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

export const debug = (store: Atom<any>): Meta => (store as any)[META]
