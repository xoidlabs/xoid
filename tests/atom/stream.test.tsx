import { atom } from 'xoid'

it("don't lazily evaluate when a mapped stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = atom<{ deep: { value: 5 } }>()
  const derivedAtom = sourceAtom.map((state) => {
    fn()
    return state.deep.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAtom.value)

  expect(fn).not.toBeCalled()
})

it("don't lazily evaluate when a mapped (twice) stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = atom<{ deep: { value: 5 } }>().map((s) => s)
  const derivedAtom = sourceAtom.map((state) => {
    fn()
    return state.deep.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAtom.value)

  expect(fn).not.toBeCalled()
})

it("don't lazily evaluate when a focused stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = atom<{ deep: { value: 5 } }>().focus('deep')
  const derivedAtom = sourceAtom.map((state) => {
    fn()
    return state.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAtom.value)

  expect(fn).not.toBeCalled()
})

it('Lazily evaluate only when one of the dependents are read', () => {
  const fn = jest.fn()
  const fn1 = jest.fn()

  const $alpha = atom(() => {
    fn()
    return { deep: { value: 5 } }
  })

  const $deep = $alpha.map((s) => {
    fn1()
    return s.deep
  })
  const $value = $deep.map((s) => s.value)

  expect(fn).not.toBeCalled()
  expect(fn1).not.toBeCalled()

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  $value.value

  expect(fn).toBeCalledTimes(1)
})

it('Never evaluate dependents of streams unless the stream value is satisfied', () => {
  const fn = jest.fn()

  const $alpha = atom<{ deep: { value: number } }>()

  const $deep = $alpha.map((s) => {
    fn()
    return s.deep
  })
  const $value = $deep.map((s) => s.value)

  expect(fn).not.toBeCalled()

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  $value.value

  expect(fn).not.toBeCalled()

  $alpha.set({ deep: { value: 12 } })

  expect(fn).not.toBeCalled()

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  $value.value

  expect(fn).not.toBeCalled()

  $deep.subscribe(console.log)

  expect(fn).not.toBeCalled()

  $alpha.set({ deep: { value: 15 } })

  expect(fn).toBeCalledTimes(1)
})

it('Continue notifying dependent subscriber', () => {
  const fn = jest.fn()

  const sourceAtom = atom<{ deep: { value: number } }>()
  const derivedAtom = sourceAtom.map((state) => state.deep.value)

  derivedAtom.subscribe(fn)

  expect(fn).toBeCalledTimes(0)

  sourceAtom.set({ deep: { value: 5 } })

  expect(fn).toBeCalledTimes(1)

  sourceAtom.set({ deep: { value: 6 } })

  expect(fn).toBeCalledTimes(2)
})

it('Continue notifying dependent subscriber after another one is unsubscribed', () => {
  const fn = jest.fn()
  const fn1 = jest.fn()

  const sourceAtom = atom<{ deep: { value: number } }>()
  const derivedAtom = sourceAtom.map((state) => state.deep.value)

  derivedAtom.subscribe(fn)
  const unsub = derivedAtom.subscribe(fn1)

  sourceAtom.set({ deep: { value: 5 } })

  expect(fn).toBeCalledTimes(1)
  expect(fn1).toBeCalledTimes(1)

  unsub()

  sourceAtom.set({ deep: { value: 6 } })

  expect(fn).toBeCalledTimes(2)
  expect(fn1).toBeCalledTimes(1)
})
