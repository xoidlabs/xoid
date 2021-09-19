export declare const META: unique symbol;
export declare const RECORD: unique symbol;
export declare const USEABLE: unique symbol;
declare const observable: unique symbol;
export declare type Observable<T> = {
    [observable]: true;
    (): T;
    (state: T): void;
    (fn: (state: T) => T): void;
};
export declare type IsObservable = {
    [observable]: true;
};
export declare type GetState = {
    <T>(store: Observable<T>): T;
    <T>(store: Observable<T | undefined>): T | undefined;
};
export declare type Init<T> = T | ((get: GetState) => T);
export declare type Listener<T> = (state: T) => unknown | ((state: T) => () => unknown);
export declare type StateOf<T extends Observable<any>> = T extends Observable<infer P> ? P : never;
declare type LiteMeta = {
    node: any;
    root: {
        notify: (value?: any) => void;
    };
};
export declare const createTarget: (meta: LiteMeta, onSet?: (meta: LiteMeta, value: any) => void) => (input?: any) => any;
export declare const createRoot: () => {
    listeners: Set<(value: any) => void>;
    notify: (value: any) => void;
    subscribe: (listener: () => void) => () => boolean;
};
export declare const createSelector: (store: Observable<any>, init: Function) => void;
export declare const subscribe: <T extends Observable<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);
export declare const effect: <T extends Observable<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);
export {};
