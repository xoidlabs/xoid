import { createStore, subscribe, set, get } from '../src'
import { deepClone, destroy, memberMap } from '../src/core/utils'

it('can destroy the store', () => {
  const store = createStore({
    value: 1,
  })

  subscribe(store, () => {
    throw new Error('did not clear listener on destroy')
  })
  destroy(store)

  set(store, { value: 2 })
  expect(get(store.value)).toEqual(2)
})

it('clones the state to produce two trees', () => {
  const value = {
    alpha: 3,
    beta: 5,
    alphaFn: (a: 5, b: 7) => a + b,
    deeply: {
      nested: { value: 'value1' },
      otherNested: {
        value1: 'value1',
        value2: 'value2',
        value3: 'value3',
      },
    },
  }

  const clones = deepClone(value, { mockStore: 'mockStore' } as any)
  expect(clones).toMatchSnapshot()

  const [symbolic, normalized] = clones

  function traverse(o: any, func: any) {
    for (var i in o) {
      func(i, o[i])
      if (o[i] !== null && typeof o[i] == 'object') {
        //going one step down in the object tree!!
        traverse(o[i], func)
      }
    }
  }
  const adresses: any = []
  traverse(symbolic, (key: any, value: any) => {
    if (key !== '=')
      adresses.push({ key, address: memberMap.get(value)?.address })
  })
  expect(adresses).toMatchSnapshot()
})
