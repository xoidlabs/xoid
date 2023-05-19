/* eslint-disable react-hooks/rules-of-hooks */
import {
  inject,
  watch,
  onMounted,
  onUnmounted,
  defineComponent,
  getCurrentInstance,
  provide,
  renderSlot,
} from 'vue'
import { create, Atom, Adapter, EffectCallback, Component, InjectionKey } from 'xoid'
import { createEvent } from 'xoid/src/internal/lite'
import { createGetState } from 'xoid/src/internal/utils'
export * from './lite'

export type VueAdapter = Adapter

const createVueAdapter = (): VueAdapter => {
  const m = createEvent()
  const u = createEvent()
  const adapter: VueAdapter = {
    inject: inject as <T>(symbol: InjectionKey<T>) => T,
    effect: (fn: EffectCallback) =>
      m.add(() => {
        const result = fn()
        if (typeof result === 'function') u.add(result)
      }),
  }
  onMounted(() => m.fire())
  onUnmounted(() => u.fire())
  return adapter
}

/**
 * @see [xoid.dev/docs/api-vue/use-setup](https://xoid.dev/docs/api-vue/use-setup)
 */
export function useSetup<T>(fn: ($props: undefined, adapter: VueAdapter) => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>, adapter: VueAdapter) => T, props: P): T
export function useSetup(fn: ($props: any, adapter: any) => any, props?: any): any {
  const api = fn.length > 1 ? createVueAdapter() : undefined
  if (arguments.length > 1) {
    const $props = create(() => props)
    onUnmounted(watch(props, () => $props.set({ ...props })))
    return fn($props, api)
  }
  return fn(undefined, api)
}

const toVue = (<T, U extends string>(arg: Component<T, U>, arg2: any) => {
  if (typeof arg === 'symbol') {
    return defineComponent({
      props: ['value'],
      setup(props) {
        // @ts-ignore
        provide(arg, props.value ?? arg2)
        return (ctx: any) => renderSlot(ctx.$slots, 'default')
      },
    })
  }
  return defineComponent({
    props: arg.props || [],
    setup(props) {
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
