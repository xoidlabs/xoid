import React from 'react'
import ReactDOM from 'react-dom'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { create, get, set, use, useStore } from '../src'
import { Store } from '../src/core/types'

const debug = (store: Store<any, any>) => {
  return {
    self: store,
    selfSerialized: JSON.stringify(store),
    get: get(store),
    getSerialized: JSON.stringify(get(store)),
    use: use(store),
  }
}

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

it('creates a store with a primitive value', () => {
  const store = create(5)
  expect(debug(store)).toMatchSnapshot()
})

it('creates a store with a record', () => {
  const store = create({ alpha: 3, beta: 5 })
  expect(debug(store)).toMatchSnapshot()
})

it('normalizes nested stores', () => {
  const store = create(create(create(5)))
  expect(debug(store)).toMatchSnapshot()
})

it('normalizes nested stores in a record', () => {
  const store = create({ alpha: create(3), beta: create(5) })
  expect(debug(store)).toMatchSnapshot()
})

it('creates a selector store', () => {
  const a = create(3)
  const b = create(5)
  const store = create((get) => get(a) + get(b))
  expect(debug(store)).toMatchSnapshot()
})

it('uses the actions in vanilla', async () => {
  const store = create({ count: 0 }, (store) => ({
    inc: () => set(store, (state) => ({ count: state.count + 1 })),
  }))
  use(store).inc()
  expect(debug(store)).toMatchSnapshot()
})

it('uses the actions in React', async () => {
  const store = create({ count: 0 }, (store) => ({
    inc: () => set(store, (state) => ({ count: state.count + 1 })),
  }))

  function Counter() {
    const [{ count }, { inc }] = useStore(store)
    React.useEffect(inc, [])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('only runs when partial state changes in React', async () => {
  const store = create({ count: 0, count2: 'constant' }, (store) => ({
    inc: () => set(store, (state) => ({ ...state, count: state.count + 1 })),
  }))

  let renderCount = 0

  function Counter() {
    const [c2] = useStore(store.count2)
    React.useEffect(use(store).inc, [])
    renderCount++
    return <div>count: {c2}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: constant')
  expect(renderCount).toBe(1)
})

it('only re-renders if selected state has changed', async () => {
  const store = create(
    {
      count: 0,
    },
    (store) => ({
      inc: () => set(store, (state) => ({ count: state.count + 1 })),
    })
  )
  let counterRenderCount = 0
  let controlRenderCount = 0

  function Counter() {
    const [count] = useStore(store.count)
    counterRenderCount++
    return <div>count: {count}</div>
  }

  function Control() {
    const { inc } = use(store)
    controlRenderCount++
    return <button onClick={inc}>button</button>
  }

  const { getByText, findByText } = render(
    <>
      <Counter />
      <Control />
    </>
  )

  fireEvent.click(getByText('button'))

  await findByText('count: 1')

  expect(counterRenderCount).toBe(2)
  expect(controlRenderCount).toBe(1)
})

it('can batch updates', async () => {
  const store = create(
    {
      count: 0,
    },
    (store) => ({
      inc: () => set(store, (state) => ({ count: state.count + 1 })),
    })
  )

  function Counter() {
    const [{ count }, { inc }] = useStore(store)
    React.useEffect(() => {
      ReactDOM.unstable_batchedUpdates(() => {
        inc()
        inc()
      })
    }, [])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 2')
})

it('can update the selector', async () => {
  const store = create(() => ({
    one: 'one',
    two: 'two',
  }))

  function Component({ selector }: any) {
    const [value] = useStore(selector)
    return <div>{value}</div>
  }

  const { findByText, rerender } = render(<Component selector={store.one} />)
  await findByText('one')

  // rerender(<Component selector={store.two} />)
  // await findByText('two')
})

it('can get the store', () => {
  const store = create({
    value: 1,
  })

  expect(get(store).value).toBe(1)
  expect(get(store.value)).toBe(1)
})

it('can set the store', () => {
  const store = create({
    value: 1,
  })

  set(store, { value: 2 })
  expect(get(store.value)).toBe(2)
  set(store, { value: 3 })
  expect(get(store.value)).toBe(3)
  set(store, (state) => ({ value: state.value + 1 }))
  expect(get(store.value)).toBe(4)
  set(store.value, (state) => state + 1)
  expect(get(store.value)).toBe(5)
})

// it('can subscribe to the store', () => {
//   const initialState = { value: 1, other: 'a' }
//   const store = createStore(initialState)

//   // Should not be called if new state identity is the same
//   let unsub = subscribe(store, () => {
//     throw new Error('subscriber called when new state identity is the same')
//   })
//   set(store, initialState)
//   unsub()

//   // Should be called if new state identity is different
//   unsub = subscribe(store, (newState: { value: number; other: string }) => {
//     expect(newState && newState.value).toBe(1)
//   })
//   setState({ ...getState() })
//   unsub()

//   // Should not be called when state slice is the same
//   unsub = subscribe(
//     () => {
//       throw new Error('subscriber called when new state is the same')
//     },
//     (s) => s.value
//   )
//   setState({ other: 'b' })
//   unsub()

//   // Should be called when state slice changes
//   unsub = subscribe(
//     (value: number | null) => {
//       expect(value).toBe(initialState.value + 1)
//     },
//     (s) => s.value
//   )
//   setState({ value: initialState.value + 1 })
//   unsub()

//   // Should not be called when equality checker returns true
//   unsub = subscribe(
//     () => {
//       throw new Error('subscriber called when equality checker returned true')
//     },
//     undefined as any,
//     () => true
//   )
//   setState({ value: initialState.value + 2 })
//   unsub()

//   // Should be called when equality checker returns false
//   unsub = subscribe(
//     (value: number | null) => {
//       expect(value).toBe(initialState.value + 2)
//     },
//     (s) => s.value,
//     () => false
//   )
//   setState(getState())
//   unsub()
// })

// it('only calls selectors when necessary', async () => {
//   const useStore = create(() => ({ a: 0, b: 0 }))
//   const { setState } = useStore
//   let inlineSelectorCallCount = 0
//   let staticSelectorCallCount = 0

//   function staticSelector(s: any) {
//     staticSelectorCallCount++
//     return s.a
//   }

//   function Component() {
//     useStore((s) => (inlineSelectorCallCount++, s.b))
//     useStore(staticSelector)
//     return (
//       <>
//         <div>inline: {inlineSelectorCallCount}</div>
//         <div>static: {staticSelectorCallCount}</div>
//       </>
//     )
//   }

//   const { rerender, findByText } = render(<Component />)
//   await findByText('inline: 1')
//   await findByText('static: 1')

//   rerender(<Component />)
//   await findByText('inline: 2')
//   await findByText('static: 1')

//   act(() => setState({ a: 1, b: 1 }))
//   await findByText('inline: 4')
//   await findByText('static: 2')
// })

// it('ensures parent components subscribe before children', async () => {
//   const useStore = create<any>(() => ({
//     children: {
//       '1': { text: 'child 1' },
//       '2': { text: 'child 2' },
//     },
//   }))
//   const api = useStore

//   function changeState() {
//     api.setState({
//       children: {
//         '3': { text: 'child 3' },
//       },
//     })
//   }

//   function Child({ id }: any) {
//     const text = useStore((s) => s.children[id].text)
//     return <div>{text}</div>
//   }

//   function Parent() {
//     const childStates = useStore((s) => s.children)
//     return (
//       <>
//         <button onClick={changeState}>change state</button>
//         {Object.keys(childStates).map((id) => (
//           <Child id={id} key={id} />
//         ))}
//       </>
//     )
//   }

//   const { getByText, findByText } = render(<Parent />)

//   fireEvent.click(getByText('change state'))

//   await findByText('child 3')
// })

// // https://github.com/onurkerimov/xoid/issues/84
// it('ensures the correct subscriber is removed on unmount', async () => {
//   const useStore = create(() => ({ count: 0 }))
//   const api = useStore

//   function increment() {
//     api.setState(({ count }) => ({ count: count + 1 }))
//   }

//   function Count() {
//     const c = useStore((s) => s.count)
//     return <div>count: {c}</div>
//   }

//   function CountWithInitialIncrement() {
//     React.useLayoutEffect(increment, [])
//     return <Count />
//   }

//   function Component() {
//     const [Counter, setCounter] = React.useState(
//       () => CountWithInitialIncrement
//     )
//     React.useLayoutEffect(() => {
//       setCounter(() => Count)
//     }, [])
//     return (
//       <>
//         <Counter />
//         <Count />
//       </>
//     )
//   }

//   const { findAllByText } = render(<Component />)

//   expect((await findAllByText('count: 1')).length).toBe(2)

//   act(increment)

//   expect((await findAllByText('count: 2')).length).toBe(2)
// })

// // https://github.com/onurkerimov/xoid/issues/86
// it('ensures a subscriber is not mistakenly overwritten', async () => {
//   const useStore = create(() => ({ count: 0 }))
//   const { setState } = useStore

//   function Count1() {
//     const c = useStore((s) => s.count)
//     return <div>count1: {c}</div>
//   }

//   function Count2() {
//     const c = useStore((s) => s.count)
//     return <div>count2: {c}</div>
//   }

//   // Add 1st subscriber.
//   const { findAllByText, rerender } = render(<Count1 />)

//   // Replace 1st subscriber with another.
//   rerender(<Count2 />)

//   // Add 2 additional subscribers.
//   rerender(
//     <>
//       <Count2 />
//       <Count1 />
//       <Count1 />
//     </>
//   )

//   // Call all subscribers
//   act(() => setState({ count: 1 }))

//   expect((await findAllByText('count1: 1')).length).toBe(2)
//   expect((await findAllByText('count2: 1')).length).toBe(1)
// })

// it('can use exposed types', () => {
//   interface ExampleState extends State {
//     num: number
//     numGet: () => number
//     numGetState: () => number
//     numSet: (v: number) => void
//     numSetState: (v: number) => void
//   }

//   const listener: StateListener<ExampleState> = (state) => {
//     if (state) {
//       const value = state.num * state.numGet() * state.numGetState()
//       state.numSet(value)
//       state.numSetState(value)
//     }
//   }
//   const selector: StateSelector<ExampleState, number> = (state) => state.num
//   const partial: PartialState<ExampleState> = { num: 2, numGet: () => 2 }
//   const partialFn: PartialState<ExampleState> = (state) => ({
//     ...state,
//     num: 2,
//   })
//   const equalityFn: EqualityChecker<ExampleState> = (state, newState) =>
//     state !== newState

//   const storeApi = create<ExampleState>((set, get) => ({
//     num: 1,
//     numGet: () => get().num,
//     numGetState: () => {
//       // TypeScript can't get the type of storeApi when it trys to enforce the signature of numGetState.
//       // Need to explicitly state the type of storeApi.getState().num or storeApi type will be type 'any'.
//       const result: number = storeApi.getState().num
//       return result
//     },
//     numSet: (v) => {
//       set({ num: v })
//     },
//     numSetState: (v) => {
//       storeApi.setState({ num: v })
//     },
//   }))
//   const useStore = storeApi

//   const stateCreator: StateCreator<ExampleState> = (set, get) => ({
//     num: 1,
//     numGet: () => get().num,
//     numGetState: () => get().num,
//     numSet: (v) => {
//       set({ num: v })
//     },
//     numSetState: (v) => {
//       set({ num: v })
//     },
//   })

//   function checkAllTypes(
//     _getState: GetState<ExampleState>,
//     _partialState: PartialState<ExampleState>,
//     _setState: SetState<ExampleState>,
//     _state: State,
//     _stateListener: StateListener<ExampleState>,
//     _stateSelector: StateSelector<ExampleState, number>,
//     _storeApi: StoreApi<ExampleState>,
//     _subscribe: Subscribe<ExampleState>,
//     _destroy: Destroy,
//     _equalityFn: EqualityChecker<ExampleState>,
//     _stateCreator: StateCreator<ExampleState>,
//     _useStore: UseStore<ExampleState>
//   ) {
//     expect(true).toBeTruthy()
//   }

//   checkAllTypes(
//     storeApi.getState,
//     Math.random() > 0.5 ? partial : partialFn,
//     storeApi.setState,
//     storeApi.getState(),
//     listener,
//     selector,
//     storeApi,
//     storeApi.subscribe,
//     storeApi.destroy,
//     equalityFn,
//     stateCreator,
//     useStore
//   )
// })
