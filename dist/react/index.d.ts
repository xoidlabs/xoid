import { Atom } from 'xoid';

/**
 * Subscribes to an xoid atom inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
declare function useAtom<T>(store: Atom<T>): T;
declare function useAtom<T, U>(store: Atom<T>, selector: (state: T) => U): U;
declare function useAtom<T, U extends keyof T>(store: Atom<T>, selector: U): T[U];
/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */
declare function useSetup<T>(model: (deps: Atom<undefined>, onCleanup: (fn: () => void) => void) => T): T;
declare function useSetup<T, P>(model: (deps: Atom<P>, onCleanup: (fn: () => void) => void) => T, props: P): T;

export { useAtom, useSetup };
