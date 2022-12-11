import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { create, use, Value } from 'xoid'
import { useAtom, useSetup } from '@xoid/react'
import { debug } from './testHelpers'

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

it('creates a atom with a primitive value', () => {
  const atom = create(5)
  expect(debug(atom)).toMatchSnapshot()
})

it('creates a atom with a record', () => {
  const atom = create({ alpha: 3, beta: 5 })
  expect(debug(atom)).toMatchSnapshot()
})

it('normalizes nested atoms in a record', () => {
  const atom = create({ alpha: create(3), beta: create(5) })
  expect(debug(atom)).toMatchSnapshot()
})

it('only runs when partial state changes in React', async () => {
  const atom = create({ count: 0, count2: 'constant' }, (atom) => ({
    inc: () => atom.update((state) => ({ ...state, count: state.count + 1 })),
  }))

  let renderCount = 0

  function Counter() {
    const c2 = useAtom(atom.focus((s) => s.count2))
    React.useEffect(use(atom).inc, [])
    renderCount++
    return <div>count: {c2}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: constant')
  expect(renderCount).toBe(1)
})

it('can batch updates', async () => {
  const atom = create(
    {
      count: 0,
    },
    (atom) => ({
      inc: () => atom.update((state) => ({ count: state.count + 1 })),
    })
  )

  function Counter() {
    const { count } = useAtom(atom)
    React.useEffect(() => {
      const { inc } = use(atom)
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
  const atom = create(() => ({
    one: 'one',
    two: 'two',
  }))

  type State = Value<typeof atom>

  function Component({ selector }: any) {
    const value = useAtom(atom.focus(selector))
    return <div>{value}</div>
  }

  const { findByText, rerender } = render(<Component selector={(s: State) => s.one} />)
  await findByText('one')

  rerender(<Component selector={(s: State) => s.two} />)
  await findByText('two')
})

it('ensures parent components subscribe before children', async () => {
  type State = {
    children: { [key: string]: { text: string } }
  }
  type Props = { id: string }
  const atom = create<State>(() => ({
    children: {
      '1': { text: 'child 1' },
      '2': { text: 'child 2' },
    },
  }))

  function changeState() {
    atom.set({
      children: {
        '3': { text: 'child 3' },
      },
    })
  }

  function Child({ id }: Props) {
    // In zustand's tests, the selector in the following line uses optional chaining.
    // In xoid, focus function cannot use optional chaining, so the test is modified.
    const { text } = useAtom(atom.focus((s) => s.children[id]))
    return <div>{text}</div>
  }

  function Parent() {
    const childStates = useAtom(atom.focus((s) => s.children))
    return (
      <>
        <button onClick={changeState}>change state</button>
        {Object.keys(childStates).map((id) => (
          <Child id={id} key={id} />
        ))}
      </>
    )
  }

  const { getByText, findByText } = render(
    <StrictMode>
      <Parent />
    </StrictMode>
  )

  fireEvent.click(getByText('change state'))

  await findByText('child 3')
})

// https://github.com/pmndrs/zustand/issues/84
it('ensures the correct subscriber is removed on unmount', async () => {
  const atom = create({ count: 0 })

  function increment() {
    atom.update(({ count }) => ({ count: count + 1 }))
  }

  function Count() {
    const c = useAtom(atom.focus((s) => s.count))
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
  const atom = create({ count: 0 })

  function Count1() {
    const c = useAtom(atom.focus((s) => s.count))
    return <div>count1: {c}</div>
  }

  function Count2() {
    const c = useAtom(atom.focus((s) => s.count))
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
  act(() => atom.set({ count: 1 }))

  expect((await findAllByText('count1: 1')).length).toBe(2)
  expect((await findAllByText('count2: 1')).length).toBe(1)
})

it('effect function of the React adapter works', () => {
  const mountFn = jest.fn()
  const unmountFn = jest.fn()
  function App() {
    useSetup((_, { effect }) => {
      effect(() => {
        mountFn()
        return () => unmountFn()
      })
    })
    return <div>hello!</div>
  }

  const { unmount } = render(<App />)

  expect(mountFn).toBeCalledTimes(1)
  expect(unmountFn).not.toBeCalled()

  unmount()

  expect(mountFn).toBeCalledTimes(1)
  expect(unmountFn).toBeCalledTimes(1)
})
