import { setIn } from 'xoid/core'

describe(`setIn`, () => {
  test(`Simple`, () => {
    const obj = { deeply: { nested: { number: 5 } } }
    const nextObj = setIn(obj, ['deeply', 'nested', 'number'], 6)

    expect(nextObj !== obj).toBe(true)
    expect(nextObj.deeply.nested.number === 6).toBe(true)
  })

  test(`Avoid copying everything when the target value is the same`, () => {
    const obj = { deeply: { nested: { number: 5 } } }
    const nextObj = setIn(obj, ['deeply', 'nested', 'number'], 5)

    expect(nextObj === obj).toBe(true)
    expect(nextObj.deeply.nested.number === 5).toBe(true)
  })
})
