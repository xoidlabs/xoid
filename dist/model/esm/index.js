import { META, RECORD } from '@xoid/engine';
import { createInstance } from '@xoid/core/utils';

const USEABLE = Symbol('use');
const fromShape = (shape) => new Proxy(createInstance({ shape }), {
    get(_, prop) {
        if (shape[prop])
            return shape[prop];
    },
});
const memoizedUseables = new WeakMap();
function model(payload, useable) {
    const isFunction = typeof payload === 'function';
    const shape = { [USEABLE]: isFunction ? payload : useable };
    if (!isFunction)
        Object.assign(shape, payload);
    return fromShape(shape);
}
function wrapped(store, o) {
    const dh = store[META].root.devtoolsHelper;
    return dh ? dh(store, o, []) : o;
}
/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
// @ts-ignore
const use = (store) => {
    var _a;
    const attempt = memoizedUseables.get(store);
    if (attempt)
        return wrapped(store, attempt);
    const shape = (_a = store[META]) === null || _a === void 0 ? void 0 : _a.shape;
    const useable = shape && shape[USEABLE];
    if (typeof useable === 'function') {
        const u = useable(store);
        memoizedUseables.set(store, u);
        return wrapped(store, u);
    }
};
/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */
const arrayOf = (model, useable) => fromShape({ [USEABLE]: useable, [RECORD]: model });
/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */
const objectOf = (model, useable) => fromShape({ [USEABLE]: useable, [RECORD]: model });

export { arrayOf, model, objectOf, use };
