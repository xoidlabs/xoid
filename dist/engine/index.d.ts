export declare const META: unique symbol;
export declare const RECORD: unique symbol;
export declare const USEABLE: unique symbol;
declare const atom: unique symbol;
export declare type Atom<T> = {
    [atom]: true;
    (): T;
    (state: Exclude<T, Function>): void;
    (fn: (state: T) => T): void;
};
export declare type IsAtom = {
    [atom]: true;
};
export declare type GetState = {
    <T>(store: Atom<T>): T;
    <T>(store: Atom<T | undefined>): T | undefined;
};
export declare type Init<T> = T | ((get: GetState) => T);
export declare type Listener<T> = (value: T, prevValue: T) => unknown | ((value: T, prevValue: T) => () => unknown);
export declare type StateOf<T extends Atom<any>> = T extends Atom<infer P> ? P : never;
declare type LiteMeta = {
    node: any;
    root: {
        notify: (value?: any) => void;
    };
};
export declare const createTarget: (meta: LiteMeta, onSet?: (meta: LiteMeta, value: any) => void) => (input?: any) => any;
export declare const createRoot: () => {
    notify: (value: any) => void;
    subscribe: (listener: () => void) => () => boolean;
};
export declare const createSelector: (store: Atom<any>, init: Function) => void;
export declare const subscribe: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);
export declare const effect: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);
export {};
