import { createTarget, META, Atom } from '@xoid/engine'

type Meta = {
  parentMeta?: Meta
  node: any
  cache: Record<string, any>
  key?: string
  address?: string[]
  shape?: any
  root: ReturnType<typeof createNotifier>
}

export const createCell = (meta: Meta, key: string) => {
  // Return the child cell if it already exists
  if (Object.prototype.hasOwnProperty.call(meta.cache, key)) return meta.cache[key]

  const address = meta.address ? meta.address.map((s) => s) : ([] as string[])

  const nextMeta = {
    parentMeta: meta,
    root: meta.root,
    key,
    address,
    get node() {
      return meta.node[key]
    },
    set node(value) {
      const copy = shallowClone(meta.node)
      copy[key] = value
      meta.node = copy
    },
    cache: {},
  } as Meta

  const target = createTarget(
    () => nextMeta.node,
    (value: any) => void (nextMeta.node = value)
  )
  const proxy: any = new Proxy(target, {
    get(_, prop: string | symbol) {
      if (prop === META) return nextMeta
      // start: prototype stuff
      const node = nextMeta.node
      if ((prop as symbol) === Symbol.toPrimitive) return () => node

      if (
        !Object.prototype.hasOwnProperty.call(node, prop) &&
        Array.isArray(node) &&
        Object.prototype.hasOwnProperty.call(Array.prototype, prop)
      ) {
        throw Error("Array prototype methods shouldn't be used with xoid stores")
      }
      // end: prototype stuff
      return createCell(nextMeta, prop as string)
    },
    set() {
      return false
    },
    has(_, key) {
      return key in nextMeta.node
    },
    ownKeys(t) {
      let keys = Reflect.ownKeys(nextMeta.node)
      keys = keys.concat(Reflect.ownKeys(t))
      return Array.from(new Set(keys))
    },
    getOwnPropertyDescriptor(t, k) {
      if (Reflect.ownKeys(t).includes(k)) return Reflect.getOwnPropertyDescriptor(t, k)
      return Reflect.getOwnPropertyDescriptor(nextMeta.node, k)
    },
  })
  meta.cache[key] = proxy
  return proxy
}

const shallowClone = (obj: any) =>
  Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

export const debug = (store: Atom<any>): Meta => (store as any)[META]
