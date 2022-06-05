import { create, use, subscribe, Atom } from 'xoid'

const debug = <T,>(atom: Atom<T>) => {
  return {
    self: atom,
    selfSerialized: JSON.stringify(atom),
    get: atom(),
    getSerialized: JSON.stringify(atom()),
    use: use(atom as any),
  }
}

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

it('lazily evaluates a state initializer function', () => {
  const fn = jest.fn()
  const atom = create(() => {
    fn()
    return 5
  })
  expect(fn).not.toBeCalled()
  expect(debug(atom)).toMatchSnapshot()
  expect(fn).toBeCalledTimes(1)
})

it('lazily evaluates a state initializer function 2', () => {
  const fn = jest.fn()
  const atom = create(() => {
    fn()
    return 5
  })
  expect(fn).not.toBeCalled()
  subscribe(atom, console.log)
  expect(fn).toBeCalledTimes(1)
})

it('lazily evaluate only when a sub atom is read/written', () => {
  const fn = jest.fn()

  const atom = create(() => {
    fn()
    return { deep: { value: 5 } }
  })
  expect(fn).not.toBeCalled()

  const subAtom = use(atom, (s) => s.deep.value)
  expect(fn).not.toBeCalled()

  subAtom(25)
  expect(fn).toBeCalledTimes(1)
})
