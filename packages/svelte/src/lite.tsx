import { Atom } from 'xoid'
import type { Readable } from 'svelte/store'

/**
 * @see [xoid.dev/docs/api-svelte/use-atom](https://xoid.dev/docs/api-svelte/use-atom)
 */

function useAtom<T>(atom: Atom<T>): Readable<T> {
  return { subscribe: atom.watch }
}

export default useAtom
