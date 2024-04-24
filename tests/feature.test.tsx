import { setup, feature } from 'xoid'

describe('feature', () => {
  test('feat', () => {
    const AlphaFeature = feature((options: { value: number }) => ({
      initialValue: options.value,
    }))

    // setup shouldnt simply give an  start/stop
    const [result] = setup(() => {
      const alpha = AlphaFeature({ value: 5 })
      return { alpha }
    })
    expect(result.alpha.initialValue).toBe(5)
  })

  test('feat2', () => {
    const AlphaFeature = feature((options: { value: number }) => ({
      initialValue: options.value,
    }))

    const [result] = setup(() => {
      const alpha = AlphaFeature({ value: 5 })
      const beta = AlphaFeature({ value: 7 })
      return { alpha, beta }
    })
    expect(result.alpha.initialValue).toBe(5)
    expect(result.beta.initialValue).toBe(5)
  })
})
