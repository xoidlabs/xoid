import React from 'react'
import create from 'xoid'
import { useStore } from '@xoid/react'

const celcius = create(20)
const fahrenheit = create(68)
const setC = (num: number) => {
  celcius(num)
  fahrenheit(num * (9 / 5) + 32)
}
const setF = (num: number) => {
  fahrenheit(num)
  celcius(num - 32 * (5 / 9))
}

export default () => {
  const C = useStore(celcius)
  const F = useStore(fahrenheit)
  return (
    <div>
      <input
        style={{ width: 50 }}
        value={C}
        onChange={(e) => setC(parseFloat(e.target.value))}
      />
      ˚C =
      <input
        style={{ width: 50 }}
        value={F}
        onChange={(e) => setF(parseFloat(e.target.value))}
      />
      ˚F
    </div>
  )
}
