// @ts-ignore
import { create, use, subscribe, Atom } from 'xoid'

const debug = (atom: Atom<any>) => {
  return {
    self: atom,
    selfSerialized: JSON.stringify(atom),
    get: atom(),
    getSerialized: JSON.stringify(atom()),
    use: use(atom as any),
  }
}

it('creates a derived atom from multiple atoms', () => {
  const a = create(3)
  const b = create(5)
  const atom = create((get) => get(a) + get(b))
  expect(debug(atom)).toMatchSnapshot()
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

it('creates a derived atom from multiple atoms (keeps in sync)', () => {
  const a = create(3)
  const b = create(5)
  const atom = create((get) => get(a) + get(b))
  expect(atom()).toBe(8)

  a((s) => s + 1)
  expect(atom()).toBe(9)
})

it('creates a derived atom using the same atom (keeps in sync)', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => {
    const value = get(firstAtom)
    return value.alpha + value.beta
  })
  expect(atom()).toBe(8)

  use(firstAtom, 'alpha')((s) => s + 1)
  expect(atom()).toBe(9)
})

it('creates a derived atom using the same atom using selectors (keeps in sync)', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => get(firstAtom, 'alpha') + get(firstAtom, 'beta'))
  expect(atom()).toBe(8)

  use(firstAtom, 'alpha')((s) => s + 1)
  expect(atom()).toBe(9)
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
