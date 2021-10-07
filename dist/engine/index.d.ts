declare const META: unique symbol;
declare const RECORD: unique symbol;
declare const USEABLE: unique symbol;
declare const atom: unique symbol;
declare type IsAtom = {
    [atom]: true;
};
declare type Atom<T> = {
    [atom]: true;
    (): T;
    (state: Exclude<T, Function>): void;
    (fn: (state: T) => T): void;
};
declare type GetState = {
    <T>(store: Atom<T>): T;
    <T>(store: Atom<T | undefined>): T | undefined;
};
declare type Init<T> = T | ((get: GetState) => T);
declare type Listener<T> = (value: T, prevValue: T) => unknown | ((value: T, prevValue: T) => () => unknown);
declare type StateOf<T extends Atom<any>> = T extends Atom<infer P> ? P : never;
declare type LiteMeta = {
    node: any;
    root: {
        notify: (value?: any) => void;
    };
};
declare const createTarget: (meta: LiteMeta, onSet?: (meta: LiteMeta, value: any) => void) => (input?: any) => any;
declare const createRoot: () => {
    notify: (value: any) => void;
    subscribe: (listener: () => void) => () => boolean;
};
declare const createSelector: (store: Atom<any>, init: Function) => void;
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
declare const subscribe: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
declare const effect: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => (() => void);

export { Atom, GetState, Init, IsAtom, Listener, META, RECORD, StateOf, USEABLE, createRoot, createSelector, createTarget, effect, subscribe };
