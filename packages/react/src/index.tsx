import { useEffect, useLayoutEffect, useDebugValue } from 'react'
import { atom, Atom } from 'xoid'
import { useConstant } from './useConstant'
import { useAdapter } from './useAdapter'

export { useAtom } from './useAtom'
export { useConstant } from './useConstant'
export { createProvider } from './useAdapter'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`,
 * but creates values **exactly once**.
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */
export function useSetup<T>(fn: () => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: P): T
export function useSetup(fn: ($props?: any) => any, props?: any): any {
  // Calling hooks conditionally wouldn't be an issue here, because we rely on just
  // the Function.length, which will remain static.
  /* eslint-disable react-hooks/rules-of-hooks */
  let result
  if (arguments.length > 1) {
    const $props = useConstant(() => atom(() => props))
    useIsoLayoutEffect(() => ($props as Atom<any>).set(props), [props])
    result = useAdapter(() => fn($props))
  } else {
    result = useAdapter(fn)
  }
  useDebugValue(result)
  return result
  /* eslint-enable react-hooks/rules-of-hooks */
}
