import { Atom } from 'xoid'
import type { Readable } from 'svelte/store'

/**
 * @see [xoid.dev/docs/framework-integrations/use-atom](https://xoid.dev/docs/framework-integrations/use-atom)
 */

export function useAtom<T>(atom: Atom<T>): Readable<T> {
  return { subscribe: atom.watch }
}
