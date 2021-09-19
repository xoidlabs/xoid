import { Observable } from '@xoid/engine';
/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
export declare const devtools: <T extends unknown>(store: Observable<T>, name?: string | undefined) => () => void;
