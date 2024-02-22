import { Ref, Actions } from 'xoid'
import type { Readable } from 'svelte/store'

/**
 * @see [xoid.dev/docs/framework-integrations/use-atom](https://xoid.dev/docs/framework-integrations/use-atom)
 */

export function useAtom<T>(atom: Ref<T>): Readable<T>
export function useAtom<T, U>(atom: Ref<T> & Actions<U>, withActions: true): [Readable<T>, U]
export function useAtom<T, U>(atom: (Ref<T> & Actions<U>) | Ref<T>, withActions?: boolean): any {
  const store = { subscribe: atom.watch }
  return withActions ? [store, (atom as any).actions] : store
}
