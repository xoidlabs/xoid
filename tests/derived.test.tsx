// @ts-ignore
import { create, use, subscribe, Atom } from 'xoid'

const debug = (store: Atom<any, any>) => {
  return {
    self: store,
    selfSerialized: JSON.stringify(store),
    get: store(),
    getSerialized: JSON.stringify(store()),
    use: use(store),
  }
}

it('creates a derived atom from multiple atoms', () => {
  const a = create(3)
  const b = create(5)
  const store = create((get) => get(a) + get(b))
  expect(debug(store)).toMatchSnapshot()
})

it('creates a derived atom using the same atom', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => {
    const value = get(firstAtom)
    return value.alpha + value.beta
  })
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a derived atom using the same atom using selectors', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => get(firstAtom, 'alpha') + get(firstAtom, 'beta'))
  expect(debug(atom)).toMatchSnapshot()
})

test('can derive state from external sources', () => {
  const fakeReduxBase = create(8)
  const fakeRedux = {
    getState: () => fakeReduxBase(),
    subscribe: (item: any) => subscribe(fakeReduxBase, item),
  }

  const reduxAtom = create((get) => get(fakeRedux.getState, fakeRedux.subscribe))
  const listener = jest.fn()

  expect(reduxAtom()).toBe(8)

  subscribe(reduxAtom, listener)
  expect(listener).not.toBeCalled()
  reduxAtom((s) => s + 1)
  expect(listener).toBeCalled()
  expect(listener).toBeCalledWith(9, 8)
})
