import { ref } from '../src/core'
import { debug } from '../src/test-helpers'

it('creates a ref with a primitive value', () => {
  const store = ref(5)
  expect(debug(store)).toMatchSnapshot()
})

it.only('creates a ref with an object', () => {
  const store = ref({ val: 25 })
  expect(store.val).toBeUndefined()
  expect(debug(store)).toMatchSnapshot()
})
