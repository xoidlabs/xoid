import React from 'react'
import { Atom } from 'xoid'
import { useEffect, useState } from 'react'
import { DotType } from '../models'

const modulate = (dot: DotType) => ({
  x: dot.x + 2 * (Math.random() - 0.5),
  y: dot.y + 2 * (Math.random() - 0.5),
})

const ModulateButton = (props: { $dots: Atom<Record<string, DotType>> }) => {
  const [state, setState] = useState(false)
  useEffect(() => {
    const listener = () => {
      props.$dots.update((s) => {
        const nextS = {} as typeof s
        Object.keys(s).forEach((key) => {
          const nextDot = modulate(s[key])
          nextS[key] = nextDot
        })
        return nextS
      })
    }
    if (state) window.addEventListener('mousemove', listener)
    return () => window.removeEventListener('mousemove', listener)
  }, [state, props.$dots])

  return (
    <button
      onClick={(e) => {
        setState(true)
        e.stopPropagation()
      }}
    >
      Modulate!
    </button>
  )
}

export default ModulateButton
