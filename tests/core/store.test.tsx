import { store } from 'xoid/core/store'

describe('store', () => {
  test('Avoids subscribing the original atom more than once', () => {
    const fn = jest.fn()
    const fn2 = jest.fn()
    const fn3 = jest.fn()

    const alpha = store({} as any, 5)
    const beta = store({
      get: alpha.get,
      subscribe: alpha.subscribe,
    })
    expect(alpha.listeners.size).toBe(0)
    expect(beta.listeners.size).toBe(0)

    const unsub = beta.subscribe(fn)

    expect(alpha.listeners.size).toBe(1)
    expect(beta.listeners.size).toBe(1)

    const unsub2 = beta.subscribe(fn2)
    const unsub3 = beta.subscribe(fn3)

    expect(alpha.listeners.size).toBe(1)
    expect(beta.listeners.size).toBe(3)

    unsub()
    unsub3()

    expect(alpha.listeners.size).toBe(1)
    expect(beta.listeners.size).toBe(1)

    unsub2()

    expect(alpha.listeners.size).toBe(0)
    expect(beta.listeners.size).toBe(0)
  })

  test('Is able to read the value of the original atom', () => {
    const fn = jest.fn()

    const alpha = store({} as any, 5)
    const beta = store({
      get: alpha.get,
      subscribe: alpha.subscribe,
    })

    expect(beta.get()).toBe(5)

    beta.subscribe(fn)
    expect(fn).not.toBeCalled()

    alpha.set(12)
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith(12)
  })

  test('Is able to read the value of a stream', () => {
    const fn = jest.fn()

    const alpha = store({} as any, 5)
    const beta = store({
      subscribe: alpha.subscribe,
    })

    beta.subscribe(fn)
    expect(fn).not.toBeCalled()

    alpha.set(12)
    expect(fn).toBeCalledWith(12)
  })
})
