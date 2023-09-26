import { inject, onMounted, onUnmounted } from 'vue'
import { setup, EffectCallback, InjectionKey } from 'xoid/setup'
import { createEvent } from '../../xoid/src/internal/lite'

export const useAdapter = <T,>(fn: () => T) => {
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
  return setup.call(adapter, fn)
}
