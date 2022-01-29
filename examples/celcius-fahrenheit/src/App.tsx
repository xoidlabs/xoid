import React from 'react'
import { create } from 'xoid'
import { useAtom } from '@xoid/react'

const celcius = create(20)
const fahrenheit = create(68)
const setC = (num: number) => {
  if (!num) num = 0
  celcius(num)
  fahrenheit(num * (9 / 5) + 32)
}
const setF = (num: number) => {
  if (!num) num = 0
  fahrenheit(num)
  celcius(num - 32 * (5 / 9))
}

export default () => {
  const C = useAtom(celcius)
  const F = useAtom(fahrenheit)
  return (
    <div>
      <input style={{ width: 50 }} value={C} onChange={(e) => setC(parseFloat(e.target.value))} />
      ˚C =
      <input style={{ width: 50 }} value={F} onChange={(e) => setF(parseFloat(e.target.value))} />
      ˚F
    </div>
  )
}
