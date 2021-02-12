import { Observable } from '@xoid/engine';
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
export declare function useStore<T>(store: Observable<T>): T;
export declare function useStore<T, U>(store: Observable<T>, selector: (state: T) => U): U;
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */
export declare function useSetup<T>(model: (deps: Observable<undefined>, onCleanup: (fn: () => void) => void) => T): T;
export declare function useSetup<T, P>(model: (deps: Observable<P>, onCleanup: (fn: () => void) => void) => T, props: P): T;
