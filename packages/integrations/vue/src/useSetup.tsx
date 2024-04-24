/* eslint-disable react-hooks/rules-of-hooks */
import { watch, onUnmounted } from 'vue'
import { atom, Atom } from 'xoid'
import { useAdapter } from './useAdapter'

/**
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */

export function useSetup<T>(fn: () => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: P): T
export function useSetup(fn: ($props?: any) => any, props?: any): any {
  if (arguments.length > 1) {
    const $props = atom(() => props)
    onUnmounted(watch(props, () => $props.set({ ...props })))
    return useAdapter(() => fn($props))
  }
  return useAdapter(fn)
}
