import { reactive, watch, computed } from '@xoid/reactive'
import create from 'xoid'
import { debug } from './testHelpers'

it('creates a derived atom using the same atom using selectors', () => {
  const proxy = reactive({ alpha: 3, beta: 5 })
  const atom = computed(() => proxy.alpha + proxy.beta)
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a derived atom using the same atom (keeps in sync)', () => {
  const proxy = reactive({ alpha: 3, beta: 5 })
  const atom = computed(() => {
    return proxy.alpha + proxy.beta
  })
  expect(atom.value).toBe(8)

  proxy.alpha++
  expect(atom.value).toBe(9)
})

it('creates a derived atom using the same atom using selectors (keeps in sync)', () => {
  const proxy = reactive({ alpha: 3, beta: 5 })
  const atom = computed(() => proxy.alpha + proxy.beta)
  expect(atom.value).toBe(8)

  proxy.alpha++
  expect(atom.value).toBe(9)
})

it('watches a proxy using the same atom using selectors (keeps in sync)', () => {
  const proxy = reactive({ alpha: 3, beta: 5 })
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

it('is able to watch atoms', () => {
  const fn = jest.fn()
  const $count = create(0)

  watch(() => fn($count.value))
  expect(fn).toBeCalledTimes(1)
  $count.value++
  expect(fn).toBeCalledTimes(2)
  expect(fn).toBeCalledWith(1)
})

it('is able to create derived state from atoms', () => {
  const $count = create(0)
  const fn = jest.fn()

  const $doubleCount = computed(() => {
    fn()
    return $count.value * 2
  })
  expect(fn).not.toBeCalled()
  expect($doubleCount.value).toBe(0)
  $count.value++
  expect($doubleCount.value).toBe(2)
})

it("Doesn't accidentally subscribe to dependencies of dependencies", () => {
  const $alpha = create(0)
  const $beta = create(() => $alpha.value)
  const fn = jest.fn()

  const $doubleCount = computed(() => {
    fn()
    return $beta.value * 2
  })
  expect(fn).not.toBeCalled()
  expect($doubleCount.value).toBe(0)
  $beta.value++
  expect($doubleCount.value).toBe(2)
  $alpha.value++
  expect($doubleCount.value).toBe(2)
})

it("Doesn't accidentally subscribe to dependencies of dependencies (both)", () => {
  const $alpha = create(0)
  const $beta = computed(() => $alpha.value)
  const $gamma = computed(() => $beta.value)

  expect($beta.value).toBe(0)
  expect($gamma.value).toBe(0)

  $alpha.value++
  expect($beta.value).toBe(1)
  expect($gamma.value).toBe(1)

  $alpha.value++
  expect($beta.value).toBe(2)
  expect($gamma.value).toBe(2)
})
