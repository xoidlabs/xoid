import { create } from '../packages/xoid/lib'
import { debug } from '../packages/helpers/debug'

it('creates a store with a primitive value', () => {
  const store = create(5)
  expect(debug(store)).toMatchSnapshot()
})

it('creates a store with an object', () => {
  const store = create({ val: 25 })
  expect(debug(store)).toMatchSnapshot()
})

it('handles debugging inner values of stores', () => {
  const store = create({ val: 25 })
  expect(debug(store.val)).toMatchSnapshot()
})

it('creates a store with a primitive value (nested stores)', () => {
  const store = create(create(5))
  expect(debug(store)).toMatchSnapshot()
})

it('creates a store with an object (nested stores)', () => {
  const store = create({ val: create(25) })
  expect(debug(store)).toMatchSnapshot()
})

it('handles debugging inner values of stores (nested stores)', () => {
  const store = create({ val: create(25) })
  expect(debug(store.val)).toMatchSnapshot()
})

it('handles displaying the shape of arrays', () => {
  const store = create([0, 2, 4, 6])
  expect(debug(store)).toMatchSnapshot()
  expect(store.map((item) => item)).toMatchSnapshot()
  expect(Array.isArray(store())).toBe(true)
})

it('handles displaying the shape of arrays (nested stores)', () => {
  const store = create([0, 2, create(4), 6])
  expect(debug(store)).toMatchSnapshot()
  expect(store.map((item) => item)).toMatchSnapshot()
  expect(Array.isArray(store())).toBe(true)
})
