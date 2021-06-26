export type Meta = {
  parentMeta: Meta
  node: Record<string, any>
  proxyCache: Record<string, any>
  identity: {}
  key: string
}

type Options = {
  symbol: symbol
  getProxyTarget: (meta: Meta) => any
  internalGet: (meta: Meta, childKey: string) => any
  extendMeta: (meta: Meta) => object
}

export const cellFactory = (options: Options) => {
  const fn = (parentMeta: Meta, key: string) => {
    const node = parentMeta.node[key]
    if (node && node[options.symbol]) return node

    const { proxyCache } = parentMeta
    if (proxyCache[key]) return proxyCache[key]

    const meta = {
      parentMeta,
      key,
      get node() {
        return parentMeta.node[key]
      },
      set node(value) {
        parentMeta.node[key] = value
      },
      proxyCache: {},
      identity: {},
    }
    ;(meta as any).extras = options.extendMeta(meta)

    const proxy: any = new Proxy(options.getProxyTarget(meta), {
      get(_, childKey: string) {
        if (((childKey as unknown) as symbol) === options.symbol) return meta
        return options.internalGet(meta, childKey)
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
    proxyCache[key] = proxy
    return proxy
  }
  return fn
}
