// @ts-ignore
import { create, use, Atom } from 'xoid'

it('can handle selectors', () => {
  const store = create({ deeply: { nested: { number: 5 } } })

  expect(use(store)).toBe(undefined)
  expect(use(store, 'deeply')()).toStrictEqual({ nested: { number: 5 } })
  expect(use(store, (s) => s.deeply)()).toStrictEqual({ nested: { number: 5 } })
  expect(use(store, (s) => s.deeply.nested)()).toStrictEqual({ number: 5 })
})

it('can handle serial selectors', () => {
  const store = create({ deeply: { nested: { number: 5 } } })
  const storeDeeply = use(store, 'deeply')

  expect(use(storeDeeply, (s) => s.nested)()).toStrictEqual({ number: 5 })
})

it('can memoize selectors', () => {
  const atom = create({ deep: { value: 5 } })
  const $deep = use(atom, 'deep')
  expect(use($deep, 'value') === use(atom, (s) => s.deep.value)).toBe(true)
})

it('can handle updates via selectors', () => {
  const store = create({ deeply: { nested: { number: 5 } } })
  const storeDeeplyNestedNumber = use(store, (s) => s.deeply.nested.number)
  const storeDeeply = use(store, 'deeply')

  storeDeeply({ nested: { number: 25 } })
  expect(storeDeeply()).toStrictEqual({ nested: { number: 25 } })

  expect(store().deeply.nested.number).toStrictEqual(25)
  expect(storeDeeplyNestedNumber()).toStrictEqual(25)
})

it('can handle updates via serial selectors', () => {
  const store = create({ deeply: { nested: { number: 5 } } })
  const storeDeeply = use(store, 'deeply')
  const storeDeeplyNestedNumber = use(storeDeeply, (s) => s.nested.number)

  storeDeeplyNestedNumber(25)
  expect(storeDeeplyNestedNumber()).toStrictEqual(25)

  expect(storeDeeply()).toStrictEqual({ nested: { number: 25 } })
  expect(store().deeply.nested.number).toStrictEqual(25)
})
