import { Listener } from './types'
import { cellFactory } from './cellFactory'
import { resolverFactory } from './resolverFactory'
import { isPrimitive, hasOwnProperty } from './utils'

export const META = Symbol('META')
const resolver = resolverFactory({ symbol: META })

export const createCell = cellFactory({
  symbol: META,
  extendMeta: (meta) => {
    const runtime = {
      listeners: new Set<Listener>(),
      subscribe: (listener: Listener) => {
        runtime.listeners.add(listener)
        return () => runtime.listeners.delete(listener)
      },
      notify: () => {
        runtime.listeners.forEach((listener) => listener())
      },
      removeKey: (key: string) => {
        console.log('removeKey?', key)
      },
      setValue: (newValue: any) => {
        if (meta.node === newValue) return
        let notifyParent = false
        // if it's previously an object, distribute the change
        const oldValueIsPrimitive = isPrimitive(meta.node)
        const newValueIsPrimitive = isPrimitive(newValue)
        if (oldValueIsPrimitive) {
          // notify also the parent for new key additions
          if (!hasOwnProperty.call(meta.parentMeta.node, meta.key))
            notifyParent = true
          // note that this setup doesn't let watching non-existing leaves
          meta.node = newValue
          if (!notifyParent) runtime.notify()
        } else {
          const oldKeys = Object.keys(meta.node)
          if (newValueIsPrimitive) {
            oldKeys.forEach((childKey) => runtime.removeKey(childKey))
            notifyParent = true
          }
          const newKeys = Object.keys(newValue)
          newKeys.forEach((childKey) => {
            // it will handle it's own notification
            const keyAdded = !hasOwnProperty.call(meta.node, childKey)
            if (keyAdded) notifyParent = true
            createCell(meta, childKey)[META].extras.setValue(newValue[childKey])
          })
          oldKeys.forEach((childKey) => {
            // Skip already processed keys
            if (!newKeys.includes(childKey)) {
              const keyRemoved = !hasOwnProperty.call(newValue, childKey)
              if (keyRemoved) {
                notifyParent = true
                runtime.removeKey(childKey)
              }
            }
          })
        }
        const parentRuntime = (meta.parentMeta as any).extras
        if (notifyParent && parentRuntime.notify) parentRuntime.notify()
      },
    }
    return runtime
  },
  getProxyTarget: (meta) => () => {
    return resolver(meta.parentMeta, meta.key)
  },
  internalGet: (meta, prop) => {
    const node = meta.node
    // start: prototype stuff
    if (((prop as unknown) as symbol) === Symbol.toPrimitive) return () => node
    if (!Object.prototype.hasOwnProperty.call(node, prop)) {
      if (node[prop]) {
        return node[prop].bind
          ? node[prop].bind(createCell(meta.parentMeta, meta.key))
          : node[prop]
      }
      return Reflect.get(meta.identity, prop)
    }
    // end: prototype stuff
    return createCell(meta, prop)
  },
})
