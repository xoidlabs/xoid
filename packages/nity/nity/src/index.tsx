import { Adapter, Atom, GetState } from 'xoid'
import jsxRuntime from 'nity/jsx-runtime'

export * from 'xoid'

type Slots<U extends string> = (key?: U) => JSX.Element

export type Component<T, U extends string = string> = {
  props?: string[]
  slots?: U[]
  setup: (
    this: Adapter,
    $props: Atom<T>,
    adapter: Adapter
  ) => (get: GetState, slots: Slots<U>) => any
}

const map = new Map()
const memoized = (runtime: any, component: any) => {
  let innerMap = map.get(runtime)
  if (!innerMap) {
    innerMap = new Map()
    map.set(runtime, innerMap)
  }
  let out = innerMap.get(component)
  if (!out) {
    out = runtime(component)
    innerMap.set(component, out)
  }
  return out
}

const component = <T, U extends string = string>(
  obj: Component<T, U>
): Component<T, U> & ((props: T) => JSX.Element) => {
  // @ts-ignore
  const fn = (props: any) => jsxRuntime.jsx(memoized(component.runtime, obj), props)
  fn.setup = obj.setup
  // @ts-ignore
  return fn
}

export default component
