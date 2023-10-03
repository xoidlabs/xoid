import { create } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

it('enhanced atoms work', () => {
  const listener = jest.fn()
  const $source = create(3)

  const fakeRedux = {
    getValue: () => $source.value,
    subscribe: $source.subscribe,
  }

  const $enhanced = create((get) => get(fakeRedux.getValue, fakeRedux.subscribe))
  $enhanced.set = $source.set

  const unsub = $enhanced.subscribe(listener)
  expect(listener).not.toBeCalled()

  $enhanced.set(3)
  expect(listener).not.toBeCalled()

  $enhanced.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect($source.value).toBe(4)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('enhanced atoms work with update function', () => {
  const listener = jest.fn()
  const $source = create(3)

  const fakeRedux = {
    getValue: () => $source.value,
    subscribe: $source.subscribe,
  }

  const $enhanced = create((get) => get(fakeRedux.getValue, fakeRedux.subscribe))
  $enhanced.set = $source.set

  const unsub = $enhanced.subscribe(listener)
  expect(listener).not.toBeCalled()

  $enhanced.update(() => 3)
  expect(listener).not.toBeCalled()

  $enhanced.update(() => 4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect($source.value).toBe(4)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('enhanced atoms also work when updates are nested', () => {
  const fn = jest.fn()
  const $source = create({ deep: { value: 24 } })

  const $enhanced = create((get) => get($source))
  $enhanced.set = (value: typeof $enhanced.value) => {
    fn()
    $source.set(value)
  }

  expect(fn).toBeCalledTimes(0)
  expect($source.value.deep.value).toBe(24)

  $enhanced.focus((s) => s.deep.value).update((s) => s + 1)

  expect(fn).toBeCalledTimes(1)
  expect($source.value.deep.value).toBe(25)
})

it('enhanced atoms should not accidentally override internal set', () => {
  const fn = jest.fn()
  const $source = create({ deep: { value: 24 } })

  const $enhanced = create((get) => get($source))
  $enhanced.set = (value: typeof $enhanced.value) => {
    fn()
    $source.set(value)
  }

  expect(fn).toBeCalledTimes(0)
  expect($source.value.deep.value).toBe(24)

  $enhanced.focus((s) => s.deep.value).update((s) => s + 1)

  expect(fn).toBeCalledTimes(1)
  expect($source.value.deep.value).toBe(25)

  // this time editing source
  $source.focus((s) => s.deep.value).update((s) => s + 1)
  expect(fn).toBeCalledTimes(1)
})
