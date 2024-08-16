import { create } from 'xoid'
import { debug } from './testHelpers'

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
  const atom = create((get) => get(firstAtom.focus('alpha')) + get(firstAtom.focus('beta')))
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a derived atom from multiple atoms (keeps in sync)', () => {
  const a = create(3)
  const b = create(5)
  const atom = create((get) => get(a) + get(b))
  expect(atom.value).toBe(8)

  a.update((s) => s + 1)
  expect(atom.value).toBe(9)
})

it('creates a derived atom using the same atom (keeps in sync)', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => {
    const value = get(firstAtom)
    return value.alpha + value.beta
  })
  expect(atom.value).toBe(8)

  firstAtom.focus('alpha').update((s) => s + 1)
  expect(atom.value).toBe(9)
})

it('creates a derived atom using the same atom using selectors (keeps in sync)', () => {
  const firstAtom = create({ alpha: 3, beta: 5 })
  const atom = create((get) => get(firstAtom.focus('alpha')) + get(firstAtom.focus('beta')))
  expect(atom.value).toBe(8)

  firstAtom.focus('alpha').update((s) => s + 1)
  expect(atom.value).toBe(9)
})

test.only('can derive state from external sources', () => {
  const fakeReduxBase = create(8)
  const fakeRedux = {
    getState: fakeReduxBase.get,
    subscribe: fakeReduxBase.subscribe,
  }

  const reduxAtom = create.call({ get: fakeRedux.getState, subscribe: fakeRedux.subscribe })
  const listener = jest.fn()

  expect(reduxAtom.value).toBe(8)

  reduxAtom.subscribe(listener)
  expect(listener).not.toBeCalled()

  reduxAtom.update((s) => s + 1)
  expect(listener).toBeCalled()
  expect(listener).toBeCalledWith(9, 8)
})
