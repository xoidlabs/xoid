import { create } from 'xoid'

it("don't lazily evaluate when a mapped stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = create<{ deep: { value: 5 } }>()
  const derivedAatom = sourceAtom.map((state) => {
    fn()
    return state.deep.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAatom.value)

  expect(fn).not.toBeCalled()
})

it("don't lazily evaluate when a mapped (twice) stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = create<{ deep: { value: 5 } }>().map((s) => s)
  const derivedAatom = sourceAtom.map((state) => {
    fn()
    return state.deep.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAatom.value)

  expect(fn).not.toBeCalled()
})

it("don't lazily evaluate when a focused stream is read", () => {
  const fn = jest.fn()

  const sourceAtom = create<{ deep: { value: 5 } }>().focus('deep')
  const derivedAatom = sourceAtom.map((state) => {
    fn()
    return state.value
  })

  expect(fn).not.toBeCalled()

  console.log(derivedAatom.value)

  expect(fn).not.toBeCalled()
})

it('Lazily evaluate only when one of the dependents are read', () => {
  const fn = jest.fn()
  const fn1 = jest.fn()

  const $alpha = create(() => {
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

  const $alpha = create<{ deep: { value: number } }>()

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
