import { provide, inject, watch, onMounted, onUnmounted, renderSlot, defineComponent } from 'vue'
import { create, Atom, EffectCallback, InjectionKey } from 'xoid'
import { createEvent } from '../../xoid/src/internal/lite'
export { useAtom } from './useAtom'

const { intercept } = (create as any).internal

const createAdapter = () => {
  const m = createEvent()
  const u = createEvent()
  const adapter = {
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
  })
}

/**
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */
export function useSetup<T>(fn: () => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: P): T
export function useSetup(fn: ($props?: any) => any, props?: any): any {
  const adapter = createAdapter()
  if (arguments.length > 1) {
    const $props = create(() => props)
    onUnmounted(watch(props, () => $props.set({ ...props })))
    return intercept(adapter, () => fn($props))
  }
  return intercept(adapter, fn)
}
