import React from 'react'
import { useSetup, useAtom } from '@xoid/react'
import { CounterSetup } from './CounterSetup'

const CounterReact = (props: { initialValue: number }) => {
  const { $counter, increment, decrement } = useSetup(CounterSetup, props)
  const counter = useAtom($counter)

  return (
    <div>
      count: {counter}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

export default CounterReact
