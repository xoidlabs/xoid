// @ts-ignore
import { create, use } from 'xoid'

it('can get state via selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })

  // @ts-ignore
  expect(use(atom)).toBe(undefined)
  expect(use(atom, 'deeply')()).toStrictEqual({ nested: { number: 5 } })
  expect(use(atom, (s) => s.deeply)()).toStrictEqual({ nested: { number: 5 } })
  expect(use(atom, (s) => s.deeply.nested)()).toStrictEqual({ number: 5 })
})

it('can handle serial selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = use(atom, 'deeply')

  expect(use(atomDeeply, (s) => s.nested)()).toStrictEqual({ number: 5 })
})

it('can memoize selectors', () => {
  const atom = create({ deep: { value: 5 } })
  const $deep = use(atom, 'deep')
  expect(use($deep, 'value') === use(atom, (s) => s.deep.value)).toBe(true)
})

it('can handle updates via selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeplyNestedNumber = use(atom, (s) => s.deeply.nested.number)
  const atomDeeply = use(atom, 'deeply')

  atomDeeply({ nested: { number: 25 } })

  expect(atomDeeply()).toStrictEqual({ nested: { number: 25 } })
  expect(atom()).toStrictEqual({ deeply: { nested: { number: 25 } } })
  expect(atom().deeply.nested.number).toStrictEqual(25)
  expect(atomDeeplyNestedNumber()).toStrictEqual(25)
})

it('can handle updates via selectors 2', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = use(atom, 'deeply')
  const atomDeeplyNestedNumber = use(atom, (s) => s.deeply.nested.number)

  atomDeeplyNestedNumber(25)

  expect(atomDeeply()).toStrictEqual({ nested: { number: 25 } })
  expect(atom()).toStrictEqual({ deeply: { nested: { number: 25 } } })
  expect(atom().deeply.nested.number).toStrictEqual(25)
  expect(atomDeeplyNestedNumber()).toStrictEqual(25)
})

it('can handle updates via serial selectors', () => {
  const atom = create({ deeply: { nested: { number: 5 } } })
  const atomDeeply = use(atom, 'deeply')
  const atomDeeplyNestedNumber = use(atomDeeply, (s) => s.nested.number)

  atomDeeplyNestedNumber(25)
  expect(atomDeeplyNestedNumber()).toStrictEqual(25)

  expect(atomDeeply()).toStrictEqual({ nested: { number: 25 } })
  expect(atom().deeply.nested.number).toStrictEqual(25)
})
