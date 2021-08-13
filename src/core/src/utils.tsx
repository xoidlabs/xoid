export type Meta = {
  parentMeta?: Meta
  node: any
  cache: Record<string, any>
  key?: string
  root: ReturnType<typeof createRoot>
}

export const META = Symbol()
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
  } as Meta
  const proxy: any = new Proxy(createTarget(meta), {
    get(_, prop: string | symbol) {
      if (prop === META) return meta
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

export const createTarget = (meta: Meta) => (input?: any) => {
  if (typeof input === 'undefined') return meta.node
  const newValue = typeof input === 'function' ? input(meta.node) : input
  if (meta.node === newValue) return
  meta.node = newValue
  meta.root.notify()
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
