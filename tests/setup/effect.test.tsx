/* eslint-disable no-sequences */
import { store, subscribe } from 'xoid/core'
import { effect } from 'xoid'

const generator = <T,>(fn: () => T) =>
  (function* () {
    while (1) yield fn()
  })()

describe('effect', () => {
  test('Nested effects', () => {
    const [A, a, B, b, C] = generator(() => jest.fn())
    const initialize = effect(() => {
      effect(() => (A(), a))
      effect(() => (B(), b))
      C()
    })

    expect(A).not.toBeCalled()
    expect(B).not.toBeCalled()
    expect(C).not.toBeCalled()

    const subscribe = initialize()

    expect(C).toBeCalled()
    expect(A).not.toBeCalled()
    expect(B).not.toBeCalled()

    const dispose = subscribe()

    expect(A).toBeCalled()
    expect(B).toBeCalled()
    expect(a).not.toBeCalled()
    expect(b).not.toBeCalled()

    dispose()

    expect(a).toBeCalled()
    expect(b).toBeCalled()
  })

  test('Nested effects (3 levels)', () => {
    const [A, a, B, b, C, c, D, E] = generator(() => jest.fn())
    const init = effect(() => {
      effect(() => (A(), a))
      effect(() => (B(), b))
      effect(() => {
        effect(() => (C(), c))

        E()
      })
      D()
    })

    expect(A).not.toBeCalled()
    expect(B).not.toBeCalled()
    expect(C).not.toBeCalled()
    expect(D).not.toBeCalled()
    expect(E).not.toBeCalled()

    const subscribe = init()

    expect(D).toBeCalled()
    expect(E).not.toBeCalled()

    const dispose = subscribe()

    expect(A).toBeCalled()
    expect(B).toBeCalled()
    expect(C).toBeCalled()
    expect(E).toBeCalled()
    expect(a).not.toBeCalled()
    expect(b).not.toBeCalled()
    expect(c).not.toBeCalled()

    dispose()

    expect(a).toBeCalled()
    expect(b).toBeCalled()
    expect(c).toBeCalled()
  })

  // test.skip('component-like', () => {
  //   const [A, a, B, b, C] = generator(() => jest.fn())
  //   const subscribe = useConstant(() =>
  //     effect(() => {
  //       effect(() => (A(), a))
  //       effect(() => (B(), b))
  //       C()
  //     })
  //   )
  //   useEffect(subscribe, [])
  // })

  test('collects unsub functions from `subscribe`', () => {
    const [A, a, B] = generator(() => jest.fn())

    const base = store({})
    const init = effect(() => {
      subscribe(
        base,
        () => {
          A()
          return a
        },
        true
      )
      B()
    })
    expect(A).not.toBeCalled()
    expect(a).not.toBeCalled()
    expect(B).not.toBeCalled()

    const mount = init()

    expect(A).toBeCalled()
    expect(a).not.toBeCalled()
    expect(B).toBeCalled()

    const unmount = mount()

    expect(A).toBeCalled()
    expect(a).not.toBeCalled()

    unmount()

    expect(a).toBeCalled()
  })
})
