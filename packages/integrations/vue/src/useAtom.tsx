import { getCurrentScope, onScopeDispose, readonly, shallowRef, Ref, DeepReadonly } from 'vue'
import { Ref, Actions } from 'xoid'

/**
 * @see [xoid.dev/docs/framework-integrations/use-atom](https://xoid.dev/docs/framework-integrations/use-atom)
 */
export function useAtom<T>(atom: Ref<T>): Readonly<Ref<DeepReadonly<T>>>
export function useAtom<T, U>(
  atom: Ref<T> & Actions<U>,
  withActions: true
): [Readonly<Ref<DeepReadonly<T>>>, U]
export function useAtom<T, U>(atom: (Ref<T> & Actions<U>) | Ref<T>, withActions?: boolean) {
  const state = shallowRef(atom.value)

  const unsubscribe = atom.subscribe((value) => {
    state.value = value
  })

  getCurrentScope() && onScopeDispose(unsubscribe)
  const result = readonly(state)
  return withActions ? [result, (atom as any).actions] : result
}
