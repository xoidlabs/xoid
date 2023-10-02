/* eslint-disable react-hooks/rules-of-hooks */
import { create, Atom } from 'xoid'
import { onDestroy } from 'svelte/internal'
import type { Readable } from 'svelte/store'
import { useAdapter } from './useAdapter'

export { useAtom } from './useAtom'

/**
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */
export function useSetup<T>(fn: () => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: Readable<P>): T
export function useSetup(fn: ($props?: any) => any, props?: Readable<any>): any {
  if (arguments.length > 1) {
    const $props = create(() => props)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onDestroy(props!.subscribe((value) => $props.set(value)))
    return useAdapter(() => fn($props))
  }
  return useAdapter(fn)
}
