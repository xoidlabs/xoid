import { Provider } from 'react'

import Doja, { create, InjectionKey, DojaInput } from 'doja'
import { createProvider, useSetup, useAtom } from '@xoid/react'
import jsxFrom from 'react/jsx-runtime'
import jsxTo from 'doja/jsx-runtime'

const swapRuntime = () => {
  ;(Doja as any).runtime = toReact
  ;(jsxTo as any).jsx = (jsxFrom as any).jsx
  ;(jsxTo as any).jsxs = (jsxFrom as any).jsxs
  ;(jsxTo as any).Fragment = (jsxFrom as any).Fragment
}

const toReact = (<T, U extends string>(arg: DojaInput<T, U>, arg2: any) => {
  if (typeof arg === 'symbol') return createProvider(arg, arg2)
  return (props: T) => {
    swapRuntime()
    // @ts-ignore
    const render = useSetup((arg as any).setup, props)
    return useAtom(() => {
      ;(Doja as any).runtime.slots = (key?: string) => (props as any)[key || 'children']
      return create(render)
    })
  }
}) as {
  <P>(component: (props: P) => JSX.Element | null): (props: P) => JSX.Element | null
  <T>(key: InjectionKey<T>, defaultValue: T): Provider<T>
}
export default toReact
