import { create } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

it('`subscribe` works', () => {
  const listener = jest.fn()
  const atom = create(3)

  const unsub = atom.subscribe(listener)
  expect(listener).not.toBeCalled()

  atom.set(3)
  expect(listener).not.toBeCalled()

  atom.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('`subscribe` works for lazily evaluated atoms', () => {
  const listener = jest.fn()
  const atom = create(() => 3)

  const unsub = atom.subscribe(listener)
  expect(listener).not.toBeCalled()

  atom.set(3)
  expect(listener).not.toBeCalled()

  atom.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('`watch` works', () => {
  const listener = jest.fn()
  const atom = create(3)

  const unsub = atom.watch(listener)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)

  atom.set(3)
  expect(listener).toBeCalledTimes(1)

  atom.set(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(2)
})

it('`watch` works for lazily evaluated atoms', () => {
  const listener = jest.fn()
  const atom = create(() => 3)

  const unsub = atom.watch(listener)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)

  atom.set(3)
  expect(listener).toBeCalledTimes(1)

  atom.set(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)

  unsub()
  expect(listener).toBeCalledTimes(2)
})
