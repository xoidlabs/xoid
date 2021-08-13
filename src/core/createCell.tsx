import { Listener } from './types'
import { cellFactory } from './cellFactory'
import { resolverFactory } from './resolverFactory'
import { isPrimitive, hasOwnProperty } from './utils'

export const META = Symbol('META')
export const CURRENT = 'current' //Symbol('current')
const resolver = resolverFactory({ symbol: META })

const generateNew = (obj: any) => {
  return Object.assign(Object.create(obj), obj)
}

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
      setValue: (newValue: any) => {
        if (meta.node === newValue) return
        // set the new value to the focused branch
        meta.node = newValue
        // start a loop
        let currentMeta = meta
        while (currentMeta.key !== ((CURRENT as unknown) as string)) {
          currentMeta = currentMeta.parentMeta
          currentMeta.node = generateNew(currentMeta.node)
        }
        // finally do the same for the root object
        currentMeta.node = generateNew(currentMeta.node)

        meta.runtime.notify()
        // let notifyParent = false
        // // if it's previously an object, distribute the change
        // const oldValueIsPrimitive = isPrimitive(meta.node)
        // const newValueIsPrimitive = isPrimitive(newValue)
        // console.log('m', meta.node)
        // if (oldValueIsPrimitive) {
        //   // notify also the parent for new key additions
        //   if (!hasOwnProperty.call(meta.parentMeta.node, meta.key)) notifyParent = true
        //   // note that this setup doesn't let watching non-existing leaves
        //   meta.node = newValue
        //   if (!notifyParent) runtime.notify()
        // } else {
        //   const oldKeys = Object.keys(meta.node)
        //   if (newValueIsPrimitive) {
        //     oldKeys.forEach((childKey) => runtime.removeKey(childKey))
        //     notifyParent = true
        //   }
        //   let newKeys: string[] = []
        //   if (!newValueIsPrimitive) {
        //     newKeys = Object.keys(newValue)
        //     newKeys.forEach((childKey) => {
        //       // it will handle it's own notification
        //       const keyAdded = !hasOwnProperty.call(meta.node, childKey)
        //       if (keyAdded) notifyParent = true
        //       createCell(meta, childKey)[META].runtime.setValue(newValue[childKey])
        //     })
        //   }

        //   oldKeys.forEach((childKey) => {
        //     // Skip already processed keys
        //     if (!newKeys.includes(childKey)) {
        //       const keyRemoved = !hasOwnProperty.call(newValue, childKey)
        //       if (keyRemoved) {
        //         notifyParent = true
        //         runtime.removeKey(childKey)
        //       }
        //     }
        //   })
        // }
        // const parentRuntime = (meta.parentMeta as any).runtime
        // if (notifyParent && parentRuntime && parentRuntime.notify) parentRuntime.notify()
      },
    }
    return runtime
  },
  getProxyTarget: (meta) => (setterInput?: any) => {
    if (typeof setterInput === 'undefined') {
      return resolver(meta.parentMeta, meta.key)
    } else {
      const isFunction = typeof setterInput === 'function'
      if (isFunction) {
        // it should either mutate or return (just like immer)
        const result = setterInput(resolver(meta.parentMeta, meta.key))
        const isReturning = typeof result !== 'undefined'
        meta.runtime.setValue(result)
      } else {
        meta.runtime.setValue(setterInput)
      }
    }
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
