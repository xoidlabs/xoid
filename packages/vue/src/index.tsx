import {
  getCurrentScope,
  onScopeDispose,
  readonly,
  shallowRef,
  inject,
  watch,
  onMounted,
  onUnmounted,
  defineComponent,
  h,
  getCurrentInstance,
} from 'vue'
import { create, Atom, Adapter, EffectCallback, Component } from 'xoid'
import { createGetState } from 'xoid/src/internal/utils'

export type VueAdapter = Adapter

/**
 * @see [xoid.dev/docs/api-vue/use-atom](https://xoid.dev/docs/api-vue/use-atom)
 */
export function useAtom<T>(atom: Atom<T>) {
  const state = shallowRef(atom.value)

  const unsubscribe = atom.subscribe((value) => {
    state.value = value
  })

  getCurrentScope() && onScopeDispose(unsubscribe)
  return readonly(state)
}

const createEvent = () => {
  const fns = new Set<Function>()
  const add = (fn: Function) => {
    fns.add(fn)
  }
  const fire = () => {
    fns.forEach((fn) => fn())
    fns.clear()
  }
  return { add, fire }
}

const createVueAdapter = (): VueAdapter => {
  const m = createEvent()
  const u = createEvent()
  const adapter: VueAdapter = {
    // @ts-ignore
    inject,
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

const toVue = <T,>(component: Component<T>) =>
  defineComponent({
    props: ['initialValue'],
    setup(props) {
      /* eslint-disable react-hooks/rules-of-hooks */
      const render = useSetup(component, props as T)
      const event = createEvent()
      const instance = getCurrentInstance()
      const get = createGetState(() => {
        event.fire()
        instance?.proxy?.$forceUpdate()
      }, event.add)
      onUnmounted(() => event.fire())
      return () => render(get, h)
    },
  })

export default toVue
