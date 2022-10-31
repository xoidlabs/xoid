import React from 'react'
import ReactDOM from 'react-dom'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { create, use, Atom, Value } from 'xoid'
import { useAtom } from '@xoid/react'

const debug = <T,>(atom: Atom<T>) => {
  return {
    self: atom,
    selfSerialized: JSON.stringify(atom),
    get: atom.value,
    getSerialized: JSON.stringify(atom.value),
    // @ts-expect-error
    use: use(atom),
  }
}

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

it('uses the actions in vanilla', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom((state) => ({ count: state.count + 1 })),
  }))
  use(atom).inc()
  expect(debug(atom)).toMatchSnapshot()
})

it('uses the actions in React', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom((state) => ({ count: state.count + 1 })),
  }))

  function Counter() {
    const { count } = useAtom(atom)
    const { inc } = use(atom)
    React.useEffect(inc, [inc])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('only runs when partial state changes in React', async () => {
  const atom = create({ count: 0, count2: 'constant' }, (atom) => ({
    inc: () => atom((state) => ({ ...state, count: state.count + 1 })),
  }))

  let renderCount = 0

  function Counter() {
    const c2 = useAtom(atom, (s) => s.count2)
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
      inc: () => atom((state) => ({ count: state.count + 1 })),
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
    const value = useAtom(atom, selector)
    return <div>{value}</div>
  }

  const { findByText, rerender } = render(<Component selector={(s: State) => s.one} />)
  await findByText('one')

  rerender(<Component selector={(s: State) => s.two} />)
  await findByText('two')
})

it('ensures parent components subscribe before children', async () => {
  type State = { children: Record<string, { text: string }> }

  const atom = create<State>(() => ({
    children: {
      '1': { text: 'child 1' },
      '2': { text: 'child 2' },
    },
  }))

  function changeState() {
    atom({
      children: {
        '3': { text: 'child 3' },
      },
    })
  }

  function Child({ id }: { id: string }) {
    const text = useAtom(atom, (s) => s.children[id].text)
    return <div>{text}</div>
  }

  function Parent() {
    const childStates = useAtom(atom, (s) => s.children)
    return (
      <>
        <button onClick={changeState}>change state</button>
        {Object.keys(childStates).map((id) => (
          <Child id={id} key={id} />
        ))}
      </>
    )
  }

  const { getByText, findByText } = render(<Parent />)

  await findByText('child 1')
  await findByText('child 2')

  fireEvent.click(getByText('change state'))

  await findByText('child 3')
})

// https://github.com/pmndrs/zustand/issues/84
it('ensures the correct subscriber is removed on unmount', async () => {
  const atom = create({ count: 0 })

  function increment() {
    atom(({ count }) => ({ count: count + 1 }))
  }

  function Count() {
    const c = useAtom(atom, (s) => s.count)
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
    const c = useAtom(atom, (s) => s.count)
    return <div>count1: {c}</div>
  }

  function Count2() {
    const c = useAtom(atom, (s) => s.count)
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
  act(() => atom({ count: 1 }))

  expect((await findAllByText('count1: 1')).length).toBe(2)
  expect((await findAllByText('count2: 1')).length).toBe(1)
})
