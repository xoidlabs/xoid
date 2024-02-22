import { setup } from 'xoid/setup/setup'
import { effect } from 'xoid/setup/effect'

describe('compose', () => {
  test('a', () => {
    const setupFn = (num: number) => {
      effect(() => {
        num++
        return () => {
          num += 10
        }
      })
      return {
        get num() {
          return num
        },
      }
    }

    const [result, subscribe] = setup(() => setupFn(5))

    expect(result.num).toBe(5)

    const dispose = subscribe()

    expect(result.num).toBe(6)

    dispose()

    expect(result.num).toBe(16)

    subscribe()

    expect(result.num).toBe(17)

    dispose()

    expect(result.num).toBe(27)
  })
})
