import { setup, EffectCallback, InjectionKey } from 'xoid/setup'
import { createEvent } from '../../xoid/src/internal/lite'
import { getContext, onDestroy, onMount } from 'svelte/internal'

export const useAdapter = <T,>(fn: () => T) => {
  const m = createEvent()
  const u = createEvent()
  const adapter = {
    inject: getContext as <T>(symbol: InjectionKey<T>) => T,
    effect: (fn: EffectCallback) =>
      m.add(() => {
        const result = fn()
        if (typeof result === 'function') u.add(result)
      }),
  }
  onMount(() => m.fire())
  onDestroy(() => u.fire())
  return setup.call(adapter, fn)
}
