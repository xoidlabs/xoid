import { Create, Listener, Store } from "./types";
export declare type Meta = {
    parentMeta?: Meta;
    node: any;
    cache: Record<string, any>;
    key?: string;
    shape?: any;
    root: ReturnType<typeof createRoot>;
};
export declare const RECORD: any;
export declare const META: any;
export declare const createCell: (parentMeta: Meta, key: string) => any;
export declare const createTarget: (meta: Meta) => (input?: any) => any;
export declare const createRoot: (mutable?: boolean | undefined) => {
    listeners: Set<() => void>;
    notify: () => void;
    subscribe: (listener: () => void) => () => boolean;
    mutable: boolean | undefined;
};
export declare const createInstance: (shape?: any) => Create;
/**
 * Subscribes to a store, or a partial store.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
export declare const subscribe: <T extends unknown>(store: Store<T>, fn: Listener<T>) => (() => void);
