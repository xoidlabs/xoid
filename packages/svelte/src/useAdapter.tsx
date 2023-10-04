import { setup, createAdapter } from 'xoid/setup'
import { getContext, onDestroy, onMount } from 'svelte/internal'

export const useAdapter = <T,>(fn: () => T): T => {
  const adapter = createAdapter({ inject: getContext })
  onMount(() => adapter.mount())
  onDestroy(() => adapter.unmount())
  return setup.call(adapter, fn)
}
