import { setup } from 'xoid'
import { getContext, onDestroy, onMount } from 'svelte'

export const useAdapter = <T,>(fn: () => T): T => {
  const [ans, controller] = setup(fn)
  onMount(controller.mount)
  onDestroy(controller.unmount)
  return ans
}
