import { create } from 'xoid'
import devtools, { $registry } from '@xoid/devtools'

const dt = {
  init: jest.fn(),
  send: jest.fn(),
}
const extension = {
  connect: jest.fn(() => dt),
}

const NumberModel = (payload: number) =>
  create(payload, (atom) => ({
    increment: () => atom.update((state) => state + 1),
    incrementAsync: async () => {
      await new Promise((resolve) => setTimeout(resolve))
      atom.update((state) => state + 1)
    },
    decrement: () => atom.update((state) => state - 1),
  }))

beforeAll(() => {
  ;(window as any).__REDUX_DEVTOOLS_EXTENSION__ = extension
  devtools()
  expect(extension.connect).toBeCalled()
})

afterAll(() => {
  ;(window as any).__REDUX_DEVTOOLS_EXTENSION__ = undefined
})

it('Devtools works', async () => {
  const $alpha = NumberModel(0)
  $alpha.debugValue = 'same name'

  const $beta = NumberModel(0)
  $beta.debugValue = 'same name'

  // wait for 1 tick
  await new Promise((resolve) => setTimeout(resolve))

  expect(dt.init).toBeCalled()

  $alpha.actions.increment()
  expect(dt.send).toBeCalledWith(
    { payload: [], type: '(same name).increment' },
    { 'same name': 1, 'same name-1': 0 }
  )

  expect($registry.value).toEqual({ 'same name': 1, 'same name-1': 0 })
})
