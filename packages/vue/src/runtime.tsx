/* eslint-disable react-hooks/rules-of-hooks */
import { onUnmounted, defineComponent, getCurrentInstance, provide, renderSlot } from 'vue'
import { Component, InjectionKey } from 'xoid'
import { createEvent } from 'xoid/src/internal/lite'
import { createGetState } from 'xoid/src/internal/utils'
import { useSetup } from '.'
import jsxFrom from 'vue/jsx-runtime'
import jsxTo from 'xoid/jsx-runtime'
import { createProvider } from './'

const swapRuntime = () => {
  ;(jsxTo as any).jsx = jsxFrom.jsx
  ;(jsxTo as any).jsxs = (jsxFrom as any).jsxs
  ;(jsxTo as any).Fragment = jsxFrom.Fragment
}

const toVue = (<T, U extends string>(arg: Component<T, U>, arg2: any) => {
  if (typeof arg === 'symbol') {
    // @ts-ignore
    return createProvider(arg, arg2)
  }
  return defineComponent({
    props: arg.props || [],
    setup(props) {
      swapRuntime()
      const render = useSetup(arg.render as any, props as T)
      const event = createEvent()
      const instance = getCurrentInstance()
      const get = createGetState(() => {
        event.fire()
        instance?.proxy?.$forceUpdate()
      }, event.add)
      onUnmounted(() => event.fire())
      // @ts-ignore
      const slots = (key?: string) => renderSlot(instance?.proxy?.$slots, key || 'default')
      // @ts-ignore
      return () => render(get, slots)
    },
  })
}) as unknown as {
  <T, U extends string>(component: Component<T, U>): (props: T) => JSX.Element | null
  <T>(key: InjectionKey<T>, defaultValue: T): React.Provider<T>
}

export default toVue
