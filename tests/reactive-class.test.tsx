import { toReactive, create, reactive } from '@xoid/reactive'

class Anonymous {}

const Reactive = new Proxy(Anonymous, {
  construct(a, b) {
    return reactive({})
  },
  apply() {
    return 4
  },
}) as {
  (): number
  new (): {}
}

it('is able to extend from a reactive base class', () => {
  class System extends Reactive {
    count = 0
    inc() {
      this.count++
    }
  }
  const instance = new System()
  expect(instance.count).toEqual(0)
  instance.inc()
  expect(instance.count).toEqual(1)
})
