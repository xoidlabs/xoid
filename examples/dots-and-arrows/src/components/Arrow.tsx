import React from 'react'
import { useAtom } from "@xoid/react"
import { Atom } from 'xoid'
import { ArrowType, BaseArrowType, DotType } from '../models'

export const ArrowBase = (props: BaseArrowType) => {
  const { from, to } = props
  return (
    <svg height="100%" width="100%" className={'Arrow'}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        style={{ stroke: 'rgb(0,0,0)', strokeWidth: 5, strokeLinecap: 'round' }}
      />
    </svg>
  )
}

const Arrow = (props: { $arrow: Atom<ArrowType>; $dots: Atom<Record<string, DotType>> }) => {
  const arrow = useAtom(props.$arrow)
  const dots = useAtom(props.$dots)
  const from = dots[arrow.from]
  const to = dots[arrow.to]
  return <ArrowBase {...{ from, to }} />
}

export default Arrow
