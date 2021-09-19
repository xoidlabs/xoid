import { Init, Observable } from '@xoid/engine';
export { subscribe, effect } from '@xoid/engine';
export type { Init, Observable, Listener, StateOf } from '@xoid/engine';
export declare const observable: <T extends unknown>(init: Init<T>) => Observable<T>;
