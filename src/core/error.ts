const errorMap = {
  'internal-0': Error('subscribeWithSelector'),
  destroy: Error('Cannot destroy non-store'),

  'array-creator': TypeError(
    'First argument of `Model.array` must be of object or undefined type.'
  ),
  'object-creator': TypeError(
    'First argument of `Model.object` must be of object or undefined type.'
  ),
  'action-function': TypeError(
    'Second argument of `createStore` must be of function type.'
  ),
}

type XoidError = keyof typeof errorMap

export const error = (id: XoidError) => {
  throw errorMap[id]
}
