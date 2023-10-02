import { toProxy, toAtom, produce } from '@xoid/proxy'
import { create } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})
const fn = jest.fn()

const initialState = { deep: { alpha: 5 } }
const $state = create(() => {
  fn()
  return initialState
})
const state = toProxy($state)

it('`toProxy` is able to make immutable updates', () => {
  expect(fn).toBeCalledTimes(1)
  expect($state.value === initialState)
  expect($state.focus('deep').value === initialState.deep)
  expect(state.deep.alpha).toBe(5)
  state.deep.alpha = 6
  expect(state.deep.alpha).toBe(6)
  expect($state.value !== initialState)
  expect($state.focus('deep').value !== initialState.deep)
})

it('`toProxy` is able to make immutable updates in classes', () => {
  class System {
    alpha = 3
    deep = { beta: 3 }
    arr = []
    increment() {
      this.alpha++
      this.deep.beta++
    }
    incOwn = () => {
      this.alpha++
      this.deep.beta++
    }
  }
  const initialInstance = new System()
  const $instance = create(initialInstance)
  const rootFn = jest.fn()
  const fn = jest.fn()
  $instance.subscribe(rootFn)
  $instance.focus('alpha').subscribe(fn)
  const proxy = toProxy($instance)

  expect(fn).toBeCalledTimes(0)

  const expectAll = (num: number) => {
    expect(proxy.alpha).toBe(num)
    expect(initialInstance.alpha).toBe(3)
    expect($instance.value.alpha).toBe(num)

    expect(proxy.deep.beta).toBe(num)
    expect(initialInstance.deep.beta).toBe(3)
    expect($instance.value.deep.beta).toBe(num)
  }

  proxy.increment()
  expectAll(4)
  expect(fn).toBeCalledTimes(1)

  proxy.increment()
  expectAll(5)
  expect(fn).toBeCalledTimes(2)

  proxy.arr.push('hi')
  expectAll(5)
  expect(fn).toBeCalledTimes(2)

  expect(proxy.arr).toEqual(['hi'])
  expect(initialInstance.arr).toEqual([])
  expect($instance.value.arr).toEqual(['hi'])

  proxy.arr.push('hello')
  expectAll(5)
  expect(proxy.arr).toEqual(['hi', 'hello'])
  expect(initialInstance.arr).toEqual([])
  expect($instance.value.arr).toEqual(['hi', 'hello'])
})

it('`toProxy` caches subproxies properly', () => {
  const { deep } = state
  expect(state.deep === deep).toBe(true)
})

it('`toAtom` retrieves the original atom', () => {
  const $deep = toAtom(state.deep)
  expect($deep === $state.focus('deep')).toBe(true)
})
