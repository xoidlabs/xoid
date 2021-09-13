import React from 'react'
import { create, model, use, Store, StoreOf } from 'xoid'
import { useStore } from '@xoid/react'

const NumberModel = model((store: Store<number>) => ({
  increment: () => store((state) => state + 1),
  decrement: () => store((state) => state - 1),
}))
type NumberStore = StoreOf<typeof NumberModel>

const redStore = NumberModel(0)
const blueStore = NumberModel(5)
const sumStore = create((get) => get(redStore) + get(blueStore))

const NumberCounter = (props: { store: NumberStore }) => {
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
