import React from 'react'
import { useAtom } from "@xoid/react"
import { Atom } from 'xoid'
import { ArrowBase } from './Arrow'
import { DotType, TemporaryArrowModel, $mousePositionDot } from '../models'

const TemporaryArrow = (props: {
  $dots: Atom<Record<string, DotType>>
  $temporaryArrow: ReturnType<typeof TemporaryArrowModel>
}) => {
  const temporaryArrow = useAtom(props.$temporaryArrow)
  const mousePositionDot = useAtom($mousePositionDot)
  const dots = useAtom(props.$dots)

  if (!temporaryArrow) return null

  const from = dots[temporaryArrow.from]
  const to = temporaryArrow.to
    ? dots[temporaryArrow.to]
    : mousePositionDot || dots[temporaryArrow.from]

  return <ArrowBase {...{ from, to }} />
}

export default TemporaryArrow
