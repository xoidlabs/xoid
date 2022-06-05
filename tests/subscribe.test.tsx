import { create, use, subscribe, Atom, effect } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

it('`subscribe` works', () => {
  const listener = jest.fn()
  const atom = create(3)

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

it('`subscribe` works for lazily evaluated atoms', () => {
  const listener = jest.fn()
  const atom = create(() => 3)

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
  const atom = create(3)

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

it('`effect` works for lazily evaluated atoms', () => {
  const listener = jest.fn()
  const atom = create(() => 3)

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
