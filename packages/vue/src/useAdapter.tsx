import { inject, onMounted, onUnmounted } from 'vue'
import { setup, createAdapter } from 'xoid/setup'

export const useAdapter = <T,>(fn: () => T) => {
  const adapter = createAdapter({ inject })
  onMounted(adapter.mount)
  onUnmounted(adapter.unmount)
  return setup.call(adapter, fn)
}
