import { create, subscribe, effect } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

const createMediatorAtom = <T extends Exclude<any, Function>>(initialState: T) => {
  const $source = create(initialState)
  const $mediator = create(
    (get) =>
      get(
        () => $source(),
        (fn: (value: T) => void) => subscribe($source, fn)
      ),
    null,
    () => (nextValue: T) => $source(() => nextValue)
  )

  return $mediator
}

it('`subscribe` works', () => {
  const listener = jest.fn()
  const atom = createMediatorAtom(3)

  const unsub = subscribe(atom, listener)
  expect(listener).not.toBeCalled()

  atom(3)
  expect(listener).not.toBeCalled()

  atom(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('`effect` works', () => {
  const listener = jest.fn()
  const atom = createMediatorAtom(3)

  const unsub = effect(atom, listener)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)

  atom(3)
  expect(listener).toBeCalledTimes(1)

  atom(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(2)
})
