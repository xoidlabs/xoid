import { render } from '@testing-library/react'
import { useAtom } from '@xoid/react'
import React from 'react'
import { create } from 'xoid'
import { debug } from './testHelpers'

it('uses the actions in vanilla (interop)', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom.update((state) => ({ count: state.count + 1 })),
  }))
  atom.actions.inc()
  expect(debug(atom)).toMatchSnapshot()
})

it('uses the actions in vanilla', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom.update((state) => ({ count: state.count + 1 })),
  }))
  atom.actions.inc()
  expect(debug(atom)).toMatchSnapshot()
})

it('uses the actions in React', async () => {
  const atom = create({ count: 0 }, (atom) => ({
    inc: () => atom.update((state) => ({ count: state.count + 1 })),
  }))

  function Counter() {
    const { count } = useAtom(atom)
    const { inc } = atom.actions
    React.useEffect(inc, [inc])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})
