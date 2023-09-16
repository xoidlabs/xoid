import { create, Atom, EffectCallback, InjectionKey } from 'xoid'
import { createEvent } from '../../xoid/src/internal/lite'
import { getContext, onDestroy, onMount } from 'svelte/internal'
import type { Readable } from 'svelte/store'

export { useAtom } from './useAtom'

const { intercept } = (create as any).internal

const createAdapter = () => {
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
  return adapter
}

/**
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */
export function useSetup<T>(fn: () => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: Readable<P>): T
export function useSetup(fn: ($props?: any) => any, props?: Readable<any>): any {
  const adapter = createAdapter()
  if (arguments.length > 1) {
    const $props = create(() => props)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDestroy(props!.subscribe((value) => $props.set(value)))
    return intercept(adapter, () => fn($props))
  }
  return intercept(adapter, fn)
}
