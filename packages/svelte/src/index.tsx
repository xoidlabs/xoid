import { create, Atom, Adapter, EffectCallback, InjectionKey } from 'xoid'
import { createEvent } from '../../xoid/src/internal/lite'
import { getContext, onDestroy, onMount } from 'svelte/internal'
import type { Readable } from 'svelte/store'
export * from './lite'

export type SvelteAdapter = Adapter

const createAdapter = (): SvelteAdapter => {
  const m = createEvent()
  const u = createEvent()
  const adapter: SvelteAdapter = {
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
 * @see [xoid.dev/docs/api-svelte/use-setup](https://xoid.dev/docs/api-svelte/use-setup)
 */
export function useSetup<T>(fn: ($props: undefined, adapter: SvelteAdapter) => T): T
export function useSetup<T, P>(
  fn: ($props: Atom<P>, adapter: SvelteAdapter) => T,
  props: Readable<P>
): T
export function useSetup(fn: ($props: any, adapter: any) => any, props?: Readable<any>): any {
  const api = fn.length > 1 ? createAdapter() : undefined
  if (arguments.length > 1) {
    const $props = create(() => props)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDestroy(props!.subscribe((value) => $props.set(value)))
    return fn($props, api)
  }
  return fn(undefined, api)
}
