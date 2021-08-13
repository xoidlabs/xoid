import { Meta } from './cellFactory'
import { createCell } from './createCell'

const isPrimitive = (value: any) =>
  (typeof value !== 'object' && typeof value !== 'function') || value === null

type Options = { symbol: symbol; interceptor?: (meta: Meta) => void }

export const resolverFactory = (options: Options) => {
  const cache = new WeakMap()
  const { symbol } = options
  const resolver = (parentMeta: any, key: string): any => {
    // {parentNode} and {key} are given separately
    const node = parentMeta.node[key]
    // forward already-proxies
    if (node && node[symbol])
      return resolver(node[symbol].parentMeta, node[symbol].key)

    const meta = createCell(parentMeta, key)[symbol]
    if (options.interceptor) options.interceptor(meta)

    if (isPrimitive(node) || parentMeta.isPrimitive) return node

    if (cache.get(node)) return cache.get(node)
    const proxy: any = new Proxy(node, {
      get(_, prop) {
        if (!Object.hasOwnProperty.call(node, prop) && node[prop]) {
          return node[prop].bind ? node[prop].bind(proxy) : node[prop]
        }
        return resolver(meta, prop as string)
      },
      set(_, prop: string, value) {
        const childMeta = createCell(meta, prop)[symbol]
        childMeta.runtime.setValue(value)
        return true
      },
    })
    cache.set(node, proxy)
    return proxy
  }
  return resolver
}
