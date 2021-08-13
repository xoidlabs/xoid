import React from 'react'
import { create, use } from 'xoid'
import { useStore } from '@xoid/react'

const NumberModel = (payload: number) =>
  create(payload, (store) => ({
    increment: () => store((state) => state + 1),
    decrement: () => store((state) => state - 1),
  }))
type NumberType = ReturnType<typeof NumberModel>

const redStore = NumberModel(0)
const blueStore = NumberModel(5)
const sumStore = create((get) => get(redStore) + get(blueStore))

const NumberCounter = (props: { store: NumberType }) => {
  const state = useStore(props.store)
  const { increment, decrement } = use(props.store)
  return (
    <div>
      {state}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

const Sum = () => {
  const state = useStore(sumStore)
  return <div>{state}</div>
}

export default () => (
  <div>
    <NumberCounter store={redStore} />
    <NumberCounter store={blueStore} />
    <Sum />
  </div>
)
