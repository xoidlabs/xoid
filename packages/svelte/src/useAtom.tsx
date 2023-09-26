import { Atom, Actions } from 'xoid'
import type { Readable } from 'svelte/store'

/**
 * @see [xoid.dev/docs/framework-integrations/use-atom](https://xoid.dev/docs/framework-integrations/use-atom)
 */

export function useAtom<T>(atom: Atom<T>): Readable<T>
export function useAtom<T, U>(atom: Atom<T> & Actions<U>, withActions: true): [Readable<T>, U]
export function useAtom<T, U>(atom: (Atom<T> & Actions<U>) | Atom<T>, withActions?: boolean): any {
  const store = { subscribe: atom.watch }
  return withActions ? [store, (atom as any).actions] : store
}
