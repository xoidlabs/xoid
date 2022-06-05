import { createTarget, parseSelector, META, RECORD, USABLE } from '@xoid/engine'
import type { Atom, createNotifier } from '@xoid/engine'

export type $Atom<T = unknown> = Atom<T> & {
  [META]: $Meta<T>
  [RECORD]?: string[]
  [USABLE]?: object
}

export type $Meta<T = unknown> = {
  notifier: ReturnType<typeof createNotifier>
  node: T
  selectors?: Record<string, $Atom<unknown>>
  devtoolsHelper?: Function
}

export const createSetValue = <T extends any>(getValue: () => T, meta: any, enhancer?: any) => {
  let setValue = (value: T) => {
    ;(meta as $Meta<T>).node = value
    meta.notifier.notify()
  }

  if (enhancer) setValue = enhancer(setValue)

  return (x: any) => {
    const nextValue = typeof x === 'function' ? x(getValue()) : x
    setValue(nextValue)
  }
}

const clone = (obj: unknown) =>
  Array.isArray(obj)
    ? obj.map((s) => s) // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

function setIn<T extends object>(obj: any, path: string[], value: any): T {
  if (!path.length) return value

  const rest = path.map((a) => a)
  const key = rest.shift() as string
  const ans = clone(obj)
  ans[key] = setIn(obj[key], rest, value)
  return ans
}

function addressProxy(address: string[]): any {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === RECORD) return address
        const newAddress = address.map((s) => s) // avoid _spread polyfill
        newAddress.push(prop as string)
        return addressProxy(newAddress)
      },
    }
  )
}

export const select = <T extends any>(atom: Atom<T>, selector: any) => {
  const { isPluck, fn } = parseSelector(selector)
  const relativePath: string[] = isPluck ? [selector] : fn(addressProxy([]))[RECORD]
  const meta = (atom as $Atom)[META]
  const path = ((atom as $Atom)[RECORD] || []).concat(relativePath)
  const hasSymbol = relativePath.some((item) => typeof item === 'symbol')

  if (!hasSymbol) {
    const pathKey = JSON.stringify(path)
    // if the path has no symbols, attempt to retrieve already memoized atom
    if (!meta.selectors) meta.selectors = {}
    if (meta.selectors[pathKey]) {
      return meta.selectors[pathKey]
    }
  }

  // Paths that contain ES6 Symbols are permitted, however they will
  // not be memoized as they serialize to "null", to avoid clashes.

  const getValue = () => fn(atom())
  const setValue = createSetValue(
    getValue,
    meta,
    // Following line should call `meta.node`, not `getValue()`
    // Because `getValue` might give the value of a derived atom.
    (setter: any) => (value: T) => setter(setIn(meta.node, path, value))
  )
  const target = createTarget(getValue, setValue) as $Atom
  // Meta should be passed as is, and never should be copied. Because
  // xoid shares the state of `meta.node` via mutability
  ;(target as $Atom)[META] = meta
  ;(target as $Atom)[RECORD] = path

  if (!hasSymbol) {
    // if the path has no symbols, memoize
    const pathKey = JSON.stringify(path)
    ;(meta.selectors as any)[pathKey] = target
  }

  return target
}
