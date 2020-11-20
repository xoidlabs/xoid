import { X } from '../core/types'
import { configObject } from './config'
import { error } from './error'
import { Root } from './root'
import { getValueByAddress } from './utils'

const data = Symbol('data')

export type Address = (string | number)[]

interface XNode<T, A> {
  [data]: XNodeData<T, A>
}

export interface XNodeData<T, A> {
  root: Root<T, A>
  address: Address
  value: any
}

export type XNode$ = XNode<any, any>
export type XNodeData$ = XNodeData<any, any>

const dataMap = new WeakMap<X.Value<any>, XNodeData$>()
export const setData = (node: X.Value<any>, data: XNodeData$) =>
  dataMap.set(node, data)
export const getData = (node: X.Value<any>) => dataMap.get(node)

const xnode = <T = any, A = any>(
  root: Root<T, A> | undefined,
  address: Address,
  value: any
): XNode<T, A> => {
  const node = preserveProto(value)
  if (root) {
    if (typeof value !== 'object' && typeof value !== 'undefined') {
      node[configObject.valueSymbol] = value
      // In alternative 1: Add this to enforce best practices
      // node.__proto__[Symbol.toPrimitive] = function () { return {} }
    }
    setData(node as X.Value<any>, { root, address, value })
  }
  return node as XNode<T, A>
}

// Following answer is used as a starting point
// https://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript/40294058#40294058
// answered Oct 27 '16 at 20:56 by trincot
export const transform = <T>(
  state: T | XNode$,
  root: Root<any, any>,
  initialAddress: Address
): any => {
  const transformInner = (
    obj: T | XNode$,
    hash = new WeakMap(),
    address: Address
  ): [XNode$, any] => {
    // If the {obj} is a primitive
    if (Object(obj) !== obj) {
      // return xnode(root, address, obj)
      return [xnode(root, address, obj), obj]
    }
    if (hash.has(obj as object)) return hash.get(obj as object) // cyclic reference
    const childRoot = getData((obj as unknown) as X.Value<unknown>)

    // If it's already a root, don't process it, only inform it about its parent
    if (childRoot) {
      childrenRoots.add({ ...childRoot, address: address })
      childRoot.root.setParent(root, address)
      // return obj as XNode$
      return [obj as XNode$, childRoot.value]
    }

    const valueNode: any = {} // set this with same prototype with obj
    const node: any = xnode(root, address, valueNode)
    hash.set(obj as object, node)

    Object.keys(obj).map((key) => {
      const newAddress = [...address, key]
      const [store, value] = transformInner((obj as any)[key], hash, newAddress)
      //addGetter(node, key, store, value)
      node[key] = store
      valueNode[key] = value
      // TODO: don't reset the hash
      hash = new WeakMap()
    })
    return [node, valueNode]
  }

  const childrenRoots = new Set<XNodeData$>()
  const childRoot = getData((state as unknown) as X.Value<unknown>)
  if (childRoot) {
    // TODO: add extensive tests to this case
    childrenRoots.add(childRoot)
    childRoot.root.setParent(root, initialAddress)
    root.setChildren(childrenRoots)
    return [state, childRoot.value]
  } else {
    root.setChildren(childrenRoots)
    const [store, value] = transformInner(state, undefined, initialAddress)
    return [store, value]
  }
}

export const addGetter = (
  node: XNode<any, any>,
  key: string,
  store: XNode$,
  value: any
) => {
  Object.defineProperty(node, key, {
    get() {
      //@ts-ignore
      if (window.naked) {
        return value
      }
      return store
    },
  })
}

function preserveProto(value: any) {
  const isFunction = typeof value === 'function'
  const isArray = Array.isArray(value)
  return isArray
    ? []
    : isFunction
    ? value // TODO: determine if there's a need to clone functions or say, HTMLElements
    : value && value.constructor && typeof value === 'object'
    ? new value.constructor({})
    : Object.create(null)
}
