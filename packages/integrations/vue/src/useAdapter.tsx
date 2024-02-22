import { inject, onMounted, onUnmounted } from 'vue'
import { setup, createAdapter } from 'xoid'
import { provide, renderSlot, defineComponent } from 'vue'
import { InjectionKey } from 'xoid'

export const createProvider = <T,>(key: InjectionKey<T>, defaultValue: T) => {
  return defineComponent({
    props: ['value'],
    setup(props) {
      provide(key, props.value ?? defaultValue)
      return (ctx: any) => renderSlot(ctx.$slots, 'default')
    },
  })
}

export const useAdapter = <T,>(fn: () => T): T => {
  const adapter = createAdapter({ inject })
  onMounted(adapter.mount)
  onUnmounted(adapter.unmount)
  return setup.call(adapter, fn)
}
