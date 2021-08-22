import { create, watch } from '../src/core'

it('handles state mutations', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn()
  watch(store.alpha, watcher)

  state.alpha = 12
  expect(watcher).toBeCalledTimes(1)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
})

it('handles state mutations (function form)', async () => {
  const store = create({ alpha: 5 })
  const watcher = jest.fn()
  watch(store.alpha, watcher)

  store.alpha(12)
  expect(watcher).toBeCalledTimes(1)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
})

it('handles state mutations (previousValue form)', async () => {
  const store = create({ alpha: 5 })
  const watcher = jest.fn()
  watch(store.alpha, watcher)

  store.alpha((value) => ++value)
  expect(watcher).toBeCalledTimes(1)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
})

it.only('handles multiple state mutations (previousValue form)', async () => {
  const store = create({ alpha: 5, beta: 7 })

  const alphaWatcher = jest.fn()
  const betaWatcher = jest.fn()
  watch(store, (state) => {
    alphaWatcher(state.alpha)
    betaWatcher(state.beta)
  })

  store((state) => {
    state.alpha = 50
    state.beta = 70
  })
  expect(alphaWatcher).toBeCalledTimes(1)
  expect(betaWatcher).toBeCalledTimes(1)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(alphaWatcher).toBeCalledTimes(2)
  expect(betaWatcher).toBeCalledTimes(2)
})

it('handles deep state mutations', async () => {
  const store = create({ deep: { alpha: 3, beta: 5 } })
  const state = store()

  const innerWatcher = jest.fn()
  watch(store.deep, (state) => {
    innerWatcher(state.alpha)
  })

  expect(innerWatcher).toBeCalledTimes(1)

  state.deep = { alpha: 30, beta: 50 }

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(innerWatcher).toBeCalledTimes(2)
})
