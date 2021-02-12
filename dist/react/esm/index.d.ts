import { Store } from '@xoid/core';
import { Observable } from '@xoid/engine';
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */
export declare function useStore<T>(store: Observable<T>): T;
/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */
export declare function useSetup<T>(model: (deps: Store<undefined>, onCleanup: (fn: () => void) => void) => T): T;
export declare function useSetup<T, P>(model: (deps: Store<P>, onCleanup: (fn: () => void) => void) => T, props: P): T;
