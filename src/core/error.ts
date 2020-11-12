/* eslint-disable prettier/prettier */
const internalError = (id: number) => {
  return Error(
    `Internal Error ${id}: This is probably a problem with xoid. Please report this on https://github.com/onurkerimov/xoid/issues.`
  )
}
const errorMap = {
  // Internal errors
  'internal-0': internalError(1001), // subscribeWithSelector
  'internal-1': internalError(1002), // updateValueOnAddress
  destroy: internalError(1003),

  // User-facing API errors
  'array-creator': TypeError(
    'First argument of `Model.array` should be of object or undefined type.'
  ),
  'object-creator': TypeError(
    'First argument of `Model.object` should be of object or undefined type.'
  ),
  'action-function': TypeError(
    'Second argument of `createStore` should be of function or undefined type.'
  ),
  'action-function-1': TypeError(
    'Second argument of `createModel` should be of function or undefined type.'
  ),
  get: TypeError('Argument of `get` should be a Store, or a Store member.'),
  set: TypeError(
    'First argument of `set` should be of Store, or a Store member.'
  ),
  use: TypeError('Argument of `use` should be of Store type.'),
  subscribe: TypeError(
    'Argument of `subscribe` should be of Store, or a Store member.'
  ),
  parent: TypeError('Argument of `parent` should be of Store type.'),
}

type XoidError = keyof typeof errorMap

export const error = (id: XoidError) => {
  return errorMap[id]
}
