import { cleanup } from '@testing-library/react'
import { atom } from 'xoid/atom/atom'
import { debug } from './testHelpers'

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

it('creates a atom with a primitive value', () => {
  const $state = atom(5)
  expect(debug($state)).toMatchSnapshot()
})

it('creates a atom with a record', () => {
  const $state = atom({ alpha: 3, beta: 5 })
  expect(debug($state)).toMatchSnapshot()
})

it('normalizes nested atoms in a record', () => {
  const $state = atom({ alpha: atom(3), beta: atom(5) })
  expect(debug($state)).toMatchSnapshot()
})

it('`subscribe` works', () => {
  const cleanup = jest.fn()
  const listener = jest.fn(() => cleanup)
  const $state = atom(3)

  const unsub = $state.subscribe(listener)
  expect(listener).not.toBeCalled()

  $state.set(3)
  expect(listener).not.toBeCalled()
  expect(cleanup).not.toBeCalled()

  $state.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect(cleanup).not.toBeCalled()

  $state.set(5)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(5, 4)
  expect(cleanup).toBeCalledTimes(1)

  unsub()
  expect(listener).toBeCalledTimes(2)
  expect(cleanup).toBeCalledTimes(2)
})

it('`subscribe` works for lazily evaluated atoms', () => {
  const cleanup = jest.fn()
  const listener = jest.fn(() => cleanup)
  const $state = atom(() => 3)

  const unsub = $state.subscribe(listener)
  expect(listener).not.toBeCalled()

  $state.set(3)
  expect(listener).not.toBeCalled()
  expect(cleanup).not.toBeCalled()

  $state.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect(cleanup).not.toBeCalled()

  $state.set(5)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(5, 4)
  expect(cleanup).toBeCalledTimes(1)

  unsub()
  expect(listener).toBeCalledTimes(2)
  expect(cleanup).toBeCalledTimes(2)
})

it('`watch` works', () => {
  const cleanup = jest.fn()
  const listener = jest.fn(() => cleanup)
  const $state = atom(3)

  const unsub = $state.watch(listener)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)
  expect(cleanup).not.toBeCalled()

  $state.set(3)
  expect(listener).toBeCalledTimes(1)
  expect(cleanup).not.toBeCalled()

  $state.set(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)
  expect(cleanup).toBeCalledTimes(1)

  unsub()
  expect(listener).toBeCalledTimes(2)
  expect(cleanup).toBeCalledTimes(2)
})

it('`watch` works for lazily evaluated atoms', () => {
  const cleanup = jest.fn()
  const listener = jest.fn(() => cleanup)
  const $state = atom(3)

  const unsub = $state.watch(listener)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(3, 3)
  expect(cleanup).not.toBeCalled()

  $state.set(3)
  expect(listener).toBeCalledTimes(1)
  expect(cleanup).not.toBeCalled()

  $state.set(4)
  expect(listener).toBeCalledTimes(2)
  expect(listener).toBeCalledWith(4, 3)
  expect(cleanup).toBeCalledTimes(1)

  unsub()
  expect(listener).toBeCalledTimes(2)
  expect(cleanup).toBeCalledTimes(2)
})
