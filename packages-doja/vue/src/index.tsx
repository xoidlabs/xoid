/* eslint-disable react-hooks/rules-of-hooks */
import { onUnmounted, defineComponent, getCurrentInstance, renderSlot } from 'vue'
import Doja, { DojaFC, InjectionKey, create } from 'doja'
import { createGetState } from '../../../packages/xoid/src/internal/utils'

import jsxFrom from 'vue/jsx-runtime'
import jsxTo from 'doja/jsx-runtime'
import { useSetup, createProvider } from '@xoid/vue'

const swapRuntime = () => {
  ;(Doja as any).runtime = toVue
  ;(jsxTo as any).jsx = jsxFrom.jsx
  ;(jsxTo as any).jsxs = (jsxFrom as any).jsxs
  ;(jsxTo as any).Fragment = jsxFrom.Fragment
}

const { createEvent } = (create as any).internal

const toVue = (<T, U extends string>(arg: DojaFC<T, U>, arg2: any) => {
  if (typeof arg === 'symbol') {
    // @ts-ignore
    return createProvider(arg, arg2)
  }
  return defineComponent({
    props: arg.props || [],
    setup(props) {
      swapRuntime()
      // @ts-ignore
      const render = useSetup((arg as any).setup || arg, props as T)

      const event = createEvent()
      const instance = getCurrentInstance()
      const get = createGetState(() => {
        event.fire()
        instance?.proxy?.$forceUpdate()
      }, event.add)
      onUnmounted(() => event.fire())
      // @ts-ignore
      return () => {
        ;(Doja as any).runtime.slots = (key?: string) =>
          renderSlot((instance as any)?.proxy?.$slots, key || 'default')
        return (render as any)(get)
      }
    },
  })
}) as unknown as {
  <T>(component: (props: T) => JSX.Element | null): (props: T) => JSX.Element | null
  <T>(key: InjectionKey<T>, defaultValue: T): React.Provider<T>
}

export default toVue
