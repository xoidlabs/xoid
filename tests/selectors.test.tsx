// @ts-ignore
import { create, use } from 'xoid'

it('can get state via selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })

  expect(atom.focus('deeply').value).toStrictEqual({ nested: { number: 5 } })
  expect(atom.focus((s) => s.deeply).value).toStrictEqual({ nested: { number: 5 } })
  expect(atom.focus((s) => s.deeply.nested).value).toStrictEqual({ number: 5 })
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
