const errorMap = {
  'action-function': TypeError(
    'Second argument of `create` should be of function or undefined type.'
  ),
  get: TypeError(
    '[xoid 1001]: Argument of `get` should be a Store, or a Store member.'
  ),
  set: TypeError(
    '[xoid 1002]: First argument of `set` should be of Store, or a Store member.'
  ),
  use: TypeError('[xoid 1003]: Argument of `use` should be of Store type.'),
  subscribe: TypeError(
    '[xoid 1004]: Argument of `subscribe` should be a Store, or a Store member.'
  ),
  mutation: TypeError(
    '[xoid 1006]: Mutating the store should be strictly avoided. Please use `set` method instead.'
  ),
  constructor: TypeError(
    '[xoid 1007]: Other stores as the initial state of `create` function is not supported.'
  ),
}

export const error = (id: keyof typeof errorMap) => errorMap[id]
