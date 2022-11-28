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

it('`watch` works for mapped atoms', () => {
  const evaluationFn = jest.fn()
  const evaluationFn2 = jest.fn()

  const listener = jest.fn()
  const listener2 = jest.fn()

  const atom = create(() => {
    evaluationFn()
    return 3
  }).map((s) => {
    evaluationFn2()
    return s
  })

  expect(evaluationFn).not.toBeCalled()
  expect(evaluationFn2).not.toBeCalled()

  const unsub = atom.watch(listener)
  expect(evaluationFn).toBeCalledTimes(1)
  expect(evaluationFn2).toBeCalledTimes(1)

  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)

  atom.set(3)
  expect(listener).toBeCalledTimes(1)

  const unsub2 = atom.watch(listener2)

  expect(evaluationFn).toBeCalledTimes(1)
  expect(evaluationFn2).toBeCalledTimes(1)

  atom.set(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)

  expect(evaluationFn).toBeCalledTimes(1)
  expect(evaluationFn2).toBeCalledTimes(1)

  unsub()
  unsub2()
  expect(listener).toBeCalledTimes(2)
})
