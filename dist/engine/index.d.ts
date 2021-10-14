declare const META: unique symbol;
declare const RECORD: unique symbol;
declare const USABLE: unique symbol;
declare const atom: unique symbol;
declare type IsAtom = {
    [atom]: true;
};
declare type MetaInternal = {
    node: any;
    notifier: ReturnType<typeof createNotifier>;
};
declare type Atom<T> = {
    [atom]: true;
    (): T;
    (state: Exclude<T, Function>): void;
    (fn: (state: T) => T): void;
};
declare type Init<T> = T | ((get: GetState) => T);
declare type Listener<T> = (value: T, prevValue: T) => unknown | (() => unknown);
declare type StateOf<T extends Atom<any>> = T extends Atom<infer P> ? P : never;
declare type OnCleanup = (fn: () => void) => void;
declare type GetState = {
    <T>(atom: Atom<T>): T;
    <T, U>(atom: Atom<T>, selector: (state: T) => U): U;
    <T, U extends keyof T>(atom: Atom<T>, selector: U): T[U];
};
declare const createTarget: (meta: MetaInternal, onSet?: (meta: MetaInternal, value: any) => void) => (input?: unknown) => any;
declare const createNotifier: () => {
    listeners: Set<(value?: unknown) => void>;
    notify: (value?: unknown) => void;
    subscribe: (listener: () => void) => () => boolean;
};
declare const createCleanup: () => {
    onCleanup: (fn: Function) => undefined;
    cleanupAll: () => void;
};
declare const parseSelector: <T, U>(selector: keyof T | ((state: T) => U)) => Function;
declare function createReadable<T>(atom: Atom<T>): Atom<T>;
declare function createReadable<T, U>(atom: Atom<T>, selector?: keyof T | ((state: T) => U)): Atom<U>;
declare const createGetState: (updateState: Listener<unknown>, onCleanup: OnCleanup) => GetState;
declare const createSelector: (atom: Atom<any>, init: Function) => void;
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
declare const subscribe: <T extends Atom<any>>(atom: T, fn: Listener<StateOf<T>>) => (() => void);
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
declare const effect: <T extends Atom<any>>(atom: T, fn: Listener<StateOf<T>>) => (() => void);

export { Atom, GetState, Init, IsAtom, Listener, META, OnCleanup, RECORD, StateOf, USABLE, createCleanup, createGetState, createNotifier, createReadable, createSelector, createTarget, effect, parseSelector, subscribe };
