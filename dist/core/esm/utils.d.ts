import { createRoot, Observable } from '@xoid/engine';
declare type Meta = {
    parentMeta?: Meta;
    node: any;
    cache: Record<string, any>;
    key?: string;
    address?: string[];
    shape?: any;
    root: ReturnType<typeof createRoot> & {
        mutable?: boolean;
        onSet?: (meta: any, value: any) => void;
    };
};
export declare const createCell: (pm: Meta, key: string) => any;
export declare const createInstance: (options?: {
    shape?: any;
    onSet?: ((value: any) => void) | undefined;
}) => any;
export declare const debug: (store: Observable<any>) => Meta;
export {};
