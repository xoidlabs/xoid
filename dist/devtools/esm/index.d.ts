import { Atom } from '@xoid/engine';

/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
declare const devtools: <T extends unknown>(atom: Atom<T>, name?: string | undefined) => () => void;

export { devtools };
