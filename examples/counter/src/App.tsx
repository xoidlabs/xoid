import React from 'react'
import { create, use } from 'xoid'
import { useAtom } from '@xoid/react'

const NumberModel = (payload: number) =>
  create(payload, (atom) => ({
    increment: () => atom((state) => state + 1),
    decrement: () => atom((state) => state - 1),
  }))
type NumberType = ReturnType<typeof NumberModel>

const $red = NumberModel(0)
const $blue = NumberModel(5)
const $sum = create((get) => get($red) + get($blue))

const NumberCounter = (props: { atom: NumberType }) => {
  const state = useAtom(props.atom)
  const { increment, decrement } = use(props.atom)
  return (
    <div>
      {state}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

const Sum = () => {
  const state = useAtom($sum)
  return <div>{state}</div>
}

const App = () => (
  <div>
    <NumberCounter atom={$red} />
    <NumberCounter atom={$blue} />
    <Sum />
  </div>
)

export default App
