import { reactive as create, watch, computed } from '@xoid/reactive'
import { debug } from './testHelpers'

it('creates a derived atom using the same atom using selectors', () => {
  const proxy = create({ alpha: 3, beta: 5 })
  const atom = computed(() => proxy.alpha + proxy.beta)
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a derived atom using the same atom (keeps in sync)', () => {
  const proxy = create({ alpha: 3, beta: 5 })
  const atom = computed(() => {
    return proxy.alpha + proxy.beta
  })
  expect(atom.value).toBe(8)

  proxy.alpha++
  expect(atom.value).toBe(9)
})

it('creates a derived atom using the same atom using selectors (keeps in sync)', () => {
  const proxy = create({ alpha: 3, beta: 5 })
  const atom = computed(() => proxy.alpha + proxy.beta)
  expect(atom.value).toBe(8)

  proxy.alpha++
  expect(atom.value).toBe(9)
})

it('watches a proxy using the same atom using selectors (keeps in sync)', () => {
  const proxy = create({ alpha: 3, beta: 5 })
  const fn = jest.fn()
  const unsub = watch(() => fn(proxy.alpha + proxy.beta))
  expect(fn).toBeCalledWith(8)

  proxy.alpha++
  expect(fn).toBeCalledWith(9)

  expect(fn).toBeCalledTimes(2)
  unsub()

  proxy.alpha++
  expect(fn).toBeCalledTimes(2)
})
