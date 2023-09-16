import { Atom, GetState } from 'xoid'
import jsxRuntime from 'doja/jsx-runtime'

export * from 'xoid'

export type DojaInput<P, _S> = ($props: Atom<P>) => (get: GetState) => JSX.Element | null

type ToProps<P, S> = S extends string ? P & Record<`slot-${S}`, JSX.Element> : P

export type DojaFC<P, S> = ((props: ToProps<P, S>) => JSX.Element | null) & AdditionalData<S>

type AdditionalData<S> = {
  props?: string[]
  slots?: S[]
}

const satisfy = <T,>(predicate: () => T, satisfier: () => void): Exclude<T, undefined> => {
  const result = predicate()
  if (!result) {
    satisfier()
    return predicate() as Exclude<T, undefined>
  }
  return result as Exclude<T, undefined>
}

const getFC = <U, V>(runtime: ((input: U) => V) & { map?: Map<U, V> }, fn: U) => {
  const map = satisfy(
    () => runtime.map,
    () => (runtime.map = new Map())
  )
  return satisfy(
    () => map.get(fn),
    () => map.set(fn, runtime(fn))
  )
}

const Doja = <P, S = undefined>(fn: DojaInput<P, S>): DojaFC<P, S> => {
  const ans = (props: any) => (jsxRuntime as any).jsx(getFC((Doja as any).runtime, fn), props)
  ans.setup = fn
  return ans
}

export default Doja

export const slots = (key?: string) => (Doja as any).runtime.slots(key)
