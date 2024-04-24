import { Atom } from 'xoid'

export const debug = <T,>(atom: Atom<T>) => {
  return {
    self: atom,
    selfSerialized: JSON.stringify(atom),
    get: atom.value,
    getSerialized: JSON.stringify(atom.value),
    // @ts-expect-error
    actions: atom.actions,
  }
}
