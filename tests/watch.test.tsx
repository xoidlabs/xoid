import React from 'react'
import ReactDOM from 'react-dom'
import { fireEvent, render } from '@testing-library/react'
import { create, effect, use, useStore } from '../packages/core/lib'

it('can run watcher', () => {
  const store = create({ alpha: 5 })
  const watcher = jest.fn()
  effect(store.alpha, watcher)

  expect(watcher).toBeCalledTimes(1)
  expect(watcher).toBeCalledWith(5)
})

it('can debounce updates', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn()
  effect(store.alpha, watcher)

  state.alpha = 12
  expect(watcher).toBeCalledTimes(1)
  expect(watcher).toBeCalledWith(5)
  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
  expect(watcher).toBeCalledWith(12)
})

it('can batch updates', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn()
  effect(store.alpha, watcher)
  expect(watcher).toBeCalledTimes(1)
  expect(watcher).toBeCalledWith(5)

  state.alpha = 12
  state.alpha = 15

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
  expect(watcher).toBeCalledWith(15)
})

it('can intercept destructurings', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn((state) => {
    state.alpha
  })
  effect(store, watcher)
  expect(watcher).toBeCalledTimes(1)
  expect(watcher).toBeCalledWith({ alpha: 5 })

  state.alpha = 12

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
  expect(watcher).toBeCalledWith({ alpha: 12 })
})

it('can avoid running when state portion is unwatched', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn()
  effect(store, watcher)
  expect(watcher).toBeCalledTimes(1)

  state.alpha = 12

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(1)
})

it.only('can batch state updates', async () => {
  const store = create({ alpha: 5 })
  const state = store()
  const watcher = jest.fn()
  effect(store.alpha, watcher)

  state.alpha = 12
  state.alpha = 15
  expect(watcher).toBeCalledTimes(1)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)

  // to make sure that it's not called after some ticks
  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
})

it('handles methods of special objects', async () => {
  class Counter {
    alpha = 3
    increment() {
      this.alpha = this.alpha + 1
    }
  }
  const instance = new Counter()
  const store = create(instance)
  const state = store()

  const watcher = jest.fn()
  effect(store.alpha, watcher)

  state.increment()
  state.increment()

  expect(watcher).toBeCalledTimes(1)
  expect(watcher).toBeCalledWith(3)

  await new Promise(setImmediate)
  await new Promise(setImmediate)
  expect(watcher).toBeCalledTimes(2)
  expect(watcher).toBeCalledWith(5)
})

it('only re-renders if selected state has changed', async () => {
  const store = create(
    {
      count: 0,
    },
    (store) => ({
      inc: () => {
        const state = store()
        state.count++
      },
    })
  )
  let counterRenderCount = 0
  let controlRenderCount = 0

  function Counter() {
    const count = useStore(store.count)
    counterRenderCount++
    return <div>count: {count}</div>
  }

  function Control() {
    const { inc } = use(store) as any
    controlRenderCount++
    return <button onClick={inc}>button</button>
  }

  const { getByText, findByText } = render(
    <>
      <Counter />
      <Control />
    </>
  )

  fireEvent.click(getByText('button'))

  await findByText('count: 1')

  expect(counterRenderCount).toBe(2)
  expect(controlRenderCount).toBe(1)
})
