import { getCurrentScope, onScopeDispose, shallowRef } from 'vue'
import { Atom } from 'xoid'

export function useAtom<T>(atom: Atom<T>) {
  const state = shallowRef()

  const unsubscribe = atom.subscribe((value) => {
    state.value = value
  })

  getCurrentScope() && onScopeDispose(unsubscribe)
  return state
}
