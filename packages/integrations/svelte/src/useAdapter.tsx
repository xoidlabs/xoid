import { setup } from 'xoid'
import { getContext, onDestroy, onMount, setContext } from 'svelte'

const ScopeSymbol = Symbol()

export const createScope = (symbol?: symbol) => setContext(ScopeSymbol, symbol || Symbol())

export const useAdapter = <T,>(fn: () => T): T => {
  const currentSymbol = getContext(ScopeSymbol)
  const [ans, controller] = setup.call(currentSymbol, fn)
  onMount(controller.mount)
  onDestroy(controller.unmount)
  return ans
}
