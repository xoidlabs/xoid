/* eslint-disable prettier/prettier */
const internalError = (id: number) => {
  return Error(
    `xoid Internal Error ${id}: This is probably a problem with xoid. Please report this on https://github.com/onurkerimov/xoid/issues.`
  )
}

const errorMap = {
  subscribeWithSelector: internalError(1101),
  updateValueOnAddress: internalError(1102),
  destroy: internalError(1103),

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

  get: TypeError(
    '[xoid 1001]: Argument of `get` should be a Store, or a Store member.'
  ),
  set: TypeError(
    '[xoid 1002]: First argument of `set` should be of Store, or a Store member.'
  ),
  use: TypeError('[xoid 1003]: Argument of `use` should be of Store type.'),
  subscribe: TypeError(
    '[xoid 1004]: Argument of `subscribe` should be of Store, or a Store member.'
  ),
  parent: TypeError(
    '[xoid 1005]: Argument of `parent` should be of Store type.'
  ),
  mutation: TypeError(
    '[xoid 1006]: Mutating the store must be strictly avoided. Please use `set` method instead.'
  ),
}

type XoidError = keyof typeof errorMap

export const error = (id: XoidError) => errorMap[id]
