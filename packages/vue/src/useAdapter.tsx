import { inject, onMounted, onUnmounted } from 'vue'
import { setup, createAdapter } from 'xoid'

export const useAdapter = <T,>(fn: () => T): T => {
  const adapter = createAdapter({ inject })
  onMounted(adapter.mount)
  onUnmounted(adapter.unmount)
  return setup.call(adapter, fn)
}
