import { getCurrentScope, onScopeDispose, readonly, shallowRef } from 'vue'
import { Atom } from 'xoid'

export function useAtom<T>(atom: Atom<T>) {
  const state = shallowRef(atom.value)

  const unsubscribe = atom.subscribe((value) => {
    state.value = value
  })

  getCurrentScope() && onScopeDispose(unsubscribe)
  return readonly(state)
}
