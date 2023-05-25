import vue, {
  provide,
  inject,
  watch,
  onMounted,
  onUnmounted,
  renderSlot,
  defineComponent,
} from 'vue'
import { create, Atom, Adapter, EffectCallback, InjectionKey } from 'xoid'
import { createEvent } from '../../xoid/src/internal/lite'
export { useAtom } from './lite'

export type VueAdapter = Adapter

const createAdapter = (): VueAdapter => {
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

export const createProvider = <T,>(key: InjectionKey<T>, defaultValue: T) => {
  return defineComponent({
    props: ['value'],
    setup(props) {
      provide(key, props.value ?? defaultValue)
      return (ctx: any) => renderSlot(ctx.$slots, 'default')
    },
  }) as unknown as (props: { value: T; children: JSX.Element }) => JSX.Element
}

/**
 * @see [xoid.dev/docs/api-vue/use-setup](https://xoid.dev/docs/api-vue/use-setup)
 */
export function useSetup<T>(fn: ($props: undefined, adapter: VueAdapter) => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>, adapter: VueAdapter) => T, props: P): T
export function useSetup(fn: ($props: any, adapter: any) => any, props?: any): any {
  const api = fn.length > 1 ? createAdapter() : undefined
  if (arguments.length > 1) {
    const $props = create(() => props)
    onUnmounted(watch(props, () => $props.set({ ...props })))
    return fn($props, api)
  }
  return fn(undefined, api)
}
