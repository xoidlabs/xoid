import React from 'react'
import { create, InjectionKey, Component } from 'xoid'
import { useAtom } from './lite'
import { createProvider, useSetup } from '.'
import jsxFrom from 'react/jsx-runtime'
import jsxTo from 'xoid/jsx-runtime'

const swapRuntime = () => {
  jsxTo.jsx = jsxFrom.jsx
  jsxTo.jsxs = jsxFrom.jsxs
  jsxTo.Fragment = jsxFrom.Fragment
}

const toReact = (<T, U extends string>(arg: Component<T, U>, arg2: any) => {
  if (typeof arg === 'symbol') return createProvider(arg, arg2)
  return (props: T) => {
    swapRuntime()
    const [render, $props] = useSetup((a, b) => {
      return [arg.render.call(b, a, b), a] as const
    }, props)
    return useAtom(() =>
      create((get) =>
        render(get, ((key?: string) => {
          const k = !key || key === 'default' ? 'children' : key
          return get($props.focus(k as any))
        }) as any)
      )
    )
  }
}) as {
  <T, U extends string>(component: Component<T, U>): (props: T) => JSX.Element | null
  <T>(key: InjectionKey<T>, defaultValue: T): React.Provider<T>
}
export default toReact
