import { create } from 'xoid'

it('can get state via selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })

  expect(atom.focus('deeply').value).toStrictEqual({ nested: { number: 5 } })
  expect(atom.focus((s) => s.deeply).value).toStrictEqual({ nested: { number: 5 } })
  expect(atom.focus((s) => s.deeply.nested).value).toStrictEqual({ number: 5 })
})

it('can get state via selectors (deeper)', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })

  const atom1 = atom.focus('deeply')
  const atom2 = atom1.focus('nested')
  const atom3 = atom2.focus('number')

  expect(atom3.value).toStrictEqual(5)
})

it('can handle serial selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = atom.focus('deeply')

  expect(atomDeeply.focus((s) => s.nested).value).toStrictEqual({ number: 5 })
})

it('can memoize selectors', () => {
  const atom = create({ deep: { value: 5 } })
  const $deep = atom.focus('deep')
  expect($deep.focus('value') === atom.focus((s) => s.deep.value)).toBe(true)
})

it('can handle updates via selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeplyNestedNumber = atom.focus((s) => s.deeply.nested.number)
  const atomDeeply = atom.focus('deeply')

  atomDeeply.set({ nested: { number: 25 } })

  expect(atomDeeply.value).toStrictEqual({ nested: { number: 25 } })
  expect(atom.value).toStrictEqual({ deeply: { nested: { number: 25 } } })
  expect(atom.value.deeply.nested.number).toStrictEqual(25)
  expect(atomDeeplyNestedNumber.value).toStrictEqual(25)
})

it('can handle updates via selectors 2', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = atom.focus('deeply')
  const atomDeeplyNestedNumber = atom.focus((s) => s.deeply.nested.number)

  atomDeeplyNestedNumber.set(25)

  expect(atomDeeply.value).toStrictEqual({ nested: { number: 25 } })
  expect(atom.value).toStrictEqual({ deeply: { nested: { number: 25 } } })
  expect(atom.value.deeply.nested.number).toStrictEqual(25)
  expect(atomDeeplyNestedNumber.value).toStrictEqual(25)
})

it('can handle updates via serial selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = atom.focus('deeply')
  const atomDeeplyNestedNumber = atomDeeply.focus((s) => s.nested.number)

  atomDeeplyNestedNumber.set(25)
  expect(atomDeeplyNestedNumber.value).toStrictEqual(25)

  expect(atomDeeply.value).toStrictEqual({ nested: { number: 25 } })
  expect(atom.value.deeply.nested.number).toStrictEqual(25)
})

it('can bail on no-op updates via selectors', () => {
  const obj = { deeply: { nested: { number: 5 } } }
  const atom = create(obj)
  const atomDeeply = atom.focus('deeply')
  const atomDeeplyNestedNumber = atom.focus((s) => s.deeply.nested.number)

  const fn = jest.fn()
  atom.subscribe(fn)
  atomDeeply.subscribe(fn)
  atomDeeplyNestedNumber.subscribe(fn)

  atomDeeplyNestedNumber.set(5)

  expect(atom.value).toBe(obj)
  expect(atomDeeply.value).toBe(obj.deeply)

  expect(fn).not.toBeCalled()
})

it('can use previous values', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = atom.focus('deeply')
  const atomDeeplyNestedNumber = atom.focus((s) => s.deeply.nested.number)

  atomDeeplyNestedNumber.update((s) => s + 1)

  expect(atomDeeply.value).toStrictEqual({ nested: { number: 6 } })
  expect(atom.value).toStrictEqual({ deeply: { nested: { number: 6 } } })
  expect(atom.value.deeply.nested.number).toStrictEqual(6)
  expect(atomDeeplyNestedNumber.value).toStrictEqual(6)
})

it('can use previous values via serial selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = atom.focus('deeply')
  const atomDeeplyNestedNumber = atomDeeply.focus((s) => s.nested.number)

  atomDeeplyNestedNumber.update((s) => s + 1)
  expect(atomDeeplyNestedNumber.value).toStrictEqual(6)

  expect(atomDeeply.value).toStrictEqual({ nested: { number: 6 } })
  expect(atom.value.deeply.nested.number).toStrictEqual(6)
})

it('Subscribes to the correct internal when .focus and .map is used adjacently', () => {
  const fn = jest.fn()

  const $props = create<{ value: number }>({ value: 5 })

  const $value = $props.focus('value')

  expect($value.value).toBe(5)

  const $other = $value.map((state) => {
    fn(state)
    return state
  })

  expect(fn).not.toBeCalled()

  $other.subscribe(console.log)

  expect(fn).toBeCalledWith(5)
})
