import { Adapter, Atom, GetState } from 'xoid'
import jsxRuntime from 'nity/jsx-runtime'

export * from 'xoid'

type Slots<U> = (key?: U) => JSX.Element

export type Component<P, S> = {
  props?: string[]
  slots?: S[]
  setup: (
    this: Adapter & { slots: Slots<S> },
    $props: Atom<P>,
    adapter: Adapter & { slots: Slots<S> }
  ) => (get: GetState) => any
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

type ToProps<P, S> = S extends string ? P & Record<`slot-${S}`, JSX.Element> : P

const component = <P, S = undefined>(
  obj: Component<P, S>
): Component<P, S> & ((props: ToProps<P, S>) => JSX.Element) => {
  // @ts-ignore
  const fn = (props: any) => jsxRuntime.jsx(memoized(component.runtime, obj), props)
  fn.setup = obj.setup
  // @ts-ignore
  return fn
}

export default component
