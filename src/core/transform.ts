import { X } from '../core/types'
import { configObject } from './config'
import { error } from './error'
import { Root } from './root'

const data = Symbol('data')

export type Address = (string | number)[]

interface XNode<T, A> {
  (): XNodeData<T, A>
  [data]: XNodeData<T, A>
}

export interface XNodeData<T, A> {
  root: Root<T, A>
  address: Address
  value: any
}

type XNode$ = XNode<any, any>
type XNodeData$ = XNodeData<any, any>

const dataMap = new WeakMap<X.Value<any>, XNodeData$>()
const setData = (node: X.Value<any>, data: XNodeData$) => {
  dataMap.set(node, data)
}
export const getData = (node: X.Value<any>) => {
  return dataMap.get(node)
}

const xnode = <T = any, A = any>(
  root: Root<T, A>,
  address: string[],
  value: any
): XNode<T, A> => {
  const isFunction = typeof value === 'function'
  const isArray = Array.isArray(value)
  const node = isArray
    ? []
    : isFunction
    ? value // TODO: determine if there's a need to clone functions or say, HTMLElements
    : value && value.constructor && typeof value === 'object'
    ? new value.constructor(value)
    : Object.create(null)

  if (typeof value !== 'object' && value) {
    node[configObject.valueSymbol] = value
    // // Add this to enforce best practices
    // node.__proto__[Symbol.toPrimitive] = function () {
    //   return {}
    // }
  }

  setData(node as X.Value<any>, { root, address, value })
  return node as XNode<T, A>
}

// Following answer is used as a starting point
// https://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript/40294058#40294058
// answered Oct 27 '16 at 20:56 by trincot
export const transform = <T>(
  root: Root<any, any>,
  initialAddress: string[] = []
): any => {
  const transformInner = (
    obj: T | XNode$,
    hash = new WeakMap(),
    address: string[] = initialAddress
  ): XNode$ => {
    // If the {obj} is a primitive
    if (Object(obj) !== obj) {
      return xnode(root, address, obj)
    }
    if (hash.has(obj as object)) return hash.get(obj as object) // cyclic reference
    const childRoot = (obj as XNode$)[data]

    // If it's already a root, don't process it, only inform it about its parent
    if (childRoot) {
      childrenRoots.add(childRoot)
      childRoot.root.setParent(root, address)
      return obj as XNode$
    }

    const node = xnode(root, address, obj)
    hash.set(obj as object, node)

    Object.keys(obj).map((key) => {
      address = []
      address.push(key)
      // @ts-ignore
      node[key] = transformInner(obj[key], hash, address)

      // TODO: don't reset the hash
      hash = new WeakMap()
    })
    return node
  }

  const state = root.getState()
  const childrenRoots = new Set<XNodeData<any, any>>()
  const childRoot = (state as XNode<any, any>)[data]
  if (childRoot) {
    // TODO: add extensive tests to this case
    childrenRoots.add(childRoot)
    childRoot.root.setParent(root, initialAddress)
    root.setChildren(childrenRoots)
    return state
  } else {
    root.setChildren(childrenRoots)
    const store = transformInner(state)
    // @ts-ignore
    store[configObject.actionsSymbol] = root.getActions()
    return store
  }
}
