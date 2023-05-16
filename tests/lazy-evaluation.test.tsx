import { create } from 'xoid'
import { debug } from './testHelpers'

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
  atom.subscribe(console.log)
  expect(fn).toBeCalledTimes(1)
})

it('lazily evaluate only when a sub atom is read/written', () => {
  const fn = jest.fn()

  const atom = create(() => {
    fn()
    return { deep: { value: 5 } }
  })
  expect(fn).not.toBeCalled()

  const subAtom = atom.focus((s) => s.deep.value)
  expect(fn).not.toBeCalled()

  subAtom.set(25)
  expect(fn).toBeCalledTimes(1)
})

it('lazily evaluate when a mapped atom is read', () => {
  const fn = jest.fn()

  const sourceAtom = create({ deep: { value: 5 } })
  const derivedAatom = sourceAtom.map((state) => {
    fn()
    return state.deep.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAatom.value)

  expect(fn).toBeCalledTimes(1)
})
