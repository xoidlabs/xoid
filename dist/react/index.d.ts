import { Atom } from 'xoid';
import { OnCleanup } from '@xoid/engine';

/**
 * Subscribes to a xoid atom inside a React function component.
 * @see [xoid.dev/docs/api-react/useatom](https://xoid.dev/docs/api-react/useatom)
 */
declare function useAtom<T>(atom: Atom<T>): T;
declare function useAtom<T, U>(atom: Atom<T>, selector: (state: T) => U): U;
declare function useAtom<T, U extends keyof T>(atom: Atom<T>, selector: U): T[U];
/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */
declare function useSetup<T>(setupFn: (deps: Atom<undefined>, onCleanup: OnCleanup) => T): T;
declare function useSetup<T, P>(setupFn: (deps: Atom<P>, onCleanup: OnCleanup) => T, props: P): T;

export { useAtom, useSetup };
