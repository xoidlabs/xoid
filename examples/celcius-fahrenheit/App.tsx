import React from 'react'
import { create, set, useStore } from 'xoid'

const celcius = create(20, (self) => (num: number) => {
  set(self, num)
  set(fahrenheit, num * (9 / 5) + 32)
})
const fahrenheit = create(68, (self) => (num: number) => {
  set(self, num)
  set(celcius, num - 32 * (5 / 9))
})

export default () => {
  const [C, setC] = useStore(celcius)
  const [F, setF] = useStore(fahrenheit)
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
