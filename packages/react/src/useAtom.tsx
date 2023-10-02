import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { useDebugValue } from 'react'
import { Atom, Actions } from 'xoid'
import { useConstant } from './useConstant'

/**
 * An atom, or a function returning an atom can be passed as the first argument.
 * When the second optional argument is set to `true`, it will also consume the actions of the atom.
 * @see [xoid.dev/docs/framework-integrations/use-atom](https://xoid.dev/docs/framework-integrations/use-atom)
 */

export function useAtom<T>(atom: Atom<T>): T
export function useAtom<T>(atom: () => Atom<T>): T
export function useAtom<T, U>(atom: Atom<T> & Actions<U>, withActions: true): [T, U]
export function useAtom<T, U>(atom: () => Atom<T> & Actions<U>, withActions: true): [T, U]
export function useAtom<T, U>(
  maybeAtom: Atom<T> | (() => Atom<T>),
  withActions?: boolean
): [T, U] | T {
  const atom =
    useConstant(() => typeof maybeAtom === 'function' && maybeAtom()) || (maybeAtom as Atom<T>)
  const value = useSyncExternalStore(
    atom.subscribe,
    () => atom.value,
    () => atom.value
  )
  useDebugValue(value)
  return withActions ? ([value, (atom as any).actions] as [T, U]) : (value as T)
}
