import { create } from 'xoid'

const consoleError = console.error
afterEach(() => {
  console.error = consoleError
})

it('mediator atoms work', () => {
  const listener = jest.fn()
  const $source = create(3)

  const fakeRedux = {
    getValue: () => $source.value,
    subscribe: $source.subscribe,
  }

  const $mediator = create((get) => get(fakeRedux.getValue, fakeRedux.subscribe))
  $mediator.set = $source.set

  const unsub = $mediator.subscribe(listener)
  expect(listener).not.toBeCalled()

  $mediator.set(3)
  expect(listener).not.toBeCalled()

  $mediator.set(4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect($source.value).toBe(4)

  unsub()
  expect(listener).toBeCalledTimes(1)
})

it('mediator atoms work with update function', () => {
  const listener = jest.fn()
  const $source = create(3)

  const fakeRedux = {
    getValue: () => $source.value,
    subscribe: $source.subscribe,
  }

  const $mediator = create((get) => get(fakeRedux.getValue, fakeRedux.subscribe))
  $mediator.set = $source.set

  const unsub = $mediator.subscribe(listener)
  expect(listener).not.toBeCalled()

  $mediator.update(() => 3)
  expect(listener).not.toBeCalled()

  $mediator.update(() => 4)
  expect(listener).toBeCalledTimes(1)
  expect(listener).toBeCalledWith(4, 3)
  expect($source.value).toBe(4)

  unsub()
  expect(listener).toBeCalledTimes(1)
})
