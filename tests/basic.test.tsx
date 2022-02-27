import React from 'react'
import ReactDOM from 'react-dom'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
// @ts-ignore
import { create, use, subscribe, Atom } from 'xoid'
// @ts-ignore
import { useAtom } from '@xoid/react'

const debug = (store: Atom<any, any>) => {
  return {
    self: store,
    selfSerialized: JSON.stringify(store),
    get: store(),
    getSerialized: JSON.stringify(store()),
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

it('normalizes nested stores in a record', () => {
  const store = create({ alpha: create(3), beta: create(5) })
  expect(debug(store)).toMatchSnapshot()
})

it('uses the actions in vanilla', async () => {
  const store = create({ count: 0 }, (store) => ({
    inc: () => store((state) => ({ count: state.count + 1 })),
  }))
  use(store).inc()
  expect(debug(store)).toMatchSnapshot()
})

it('uses the actions in React', async () => {
  const store = create({ count: 0 }, (store) => ({
    inc: () => store((state) => ({ count: state.count + 1 })),
  }))

  function Counter() {
    const { count } = useAtom(store)
    const { inc } = use(store)
    React.useEffect(inc, [inc])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('only runs when partial state changes in React', async () => {
  const store = create({ count: 0, count2: 'constant' }, (store) => ({
    inc: () => store((state) => ({ ...state, count: state.count + 1 })),
  }))

  let renderCount = 0

  function Counter() {
    const c2 = useAtom(store, (s) => s.count2)
    React.useEffect(use(store).inc, [])
    renderCount++
    return <div>count: {c2}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: constant')
  expect(renderCount).toBe(1)
})

it('can batch updates', async () => {
  const store = create(
    {
      count: 0,
    },
    (store) => ({
      inc: () => store((state) => ({ count: state.count + 1 })),
    })
  )

  function Counter() {
    const { count } = useAtom(store)
    const { inc } = use(store)
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
    const value = useAtom(store, selector)
    return <div>{value}</div>
  }

  const { findByText, rerender } = render(<Component selector={(s) => s.one} />)
  await findByText('one')

  rerender(<Component selector={(s) => s.two} />)
  await findByText('two')
})

it.skip('ensures parent components subscribe before children', async () => {
  const store = create(() => ({
    children: {
      '1': { text: 'child 1' },
      '2': { text: 'child 2' },
    },
  }))

  function changeState() {
    store({
      children: {
        '3': { text: 'child 3' },
      },
    })
  }

  function Child({ id }: any) {
    console.log(id)
    const text = useAtom(store, (s) => s.children[id].text)
    return <div>{text}</div>
  }

  function Parent() {
    const childStates = useAtom(store, (s) => s.children)
    return (
      <>
        <button onClick={changeState}>change state</button>
        {Object.keys(childStates).map((id: any) => (
          <Child id={id} key={id} />
        ))}
      </>
    )
  }

  const { getByText, findByText } = render(<Parent />)

  fireEvent.click(getByText('change state'))

  // await findByText('child 3')
})

// https://github.com/pmndrs/zustand/issues/84
it('ensures the correct subscriber is removed on unmount', async () => {
  const store = create({ count: 0 })

  function increment() {
    store(({ count }) => ({ count: count + 1 }))
  }

  function Count() {
    const c = useAtom(store, (s) => s.count)
    return <div>count: {c}</div>
  }

  function CountWithInitialIncrement() {
    React.useLayoutEffect(increment, [])
    return <Count />
  }

  function Component() {
    const [Counter, setCounter] = React.useState(() => CountWithInitialIncrement)
    React.useLayoutEffect(() => {
      setCounter(() => Count)
    }, [])
    return (
      <>
        <Counter />
        <Count />
      </>
    )
  }

  const { findAllByText } = render(<Component />)

  expect((await findAllByText('count: 1')).length).toBe(2)

  act(increment)

  expect((await findAllByText('count: 2')).length).toBe(2)
})

// https://github.com/pmndrs/zustand/issues/86
it('ensures a subscriber is not mistakenly overwritten', async () => {
  const store = create({ count: 0 })

  function Count1() {
    const c = useAtom(store, (s) => s.count)
    return <div>count1: {c}</div>
  }

  function Count2() {
    const c = useAtom(store, (s) => s.count)
    return <div>count2: {c}</div>
  }

  // Add 1st subscriber.
  const { findAllByText, rerender } = render(<Count1 />)

  // Replace 1st subscriber with another.
  rerender(<Count2 />)

  // Add 2 additional subscribers.
  rerender(
    <>
      <Count2 />
      <Count1 />
      <Count1 />
    </>
  )

  // Call all subscribers
  act(() => store({ count: 1 }))

  expect((await findAllByText('count1: 1')).length).toBe(2)
  expect((await findAllByText('count2: 1')).length).toBe(1)
})
