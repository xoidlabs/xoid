import { useAtom } from '@xoid/react'
import { Atom } from 'xoid'
import React from 'react'
import { DotType } from '../models'

const Dot = (props: { $dot: Atom<DotType> } & React.ComponentProps<'div'>) => {
  const { $dot, ...rest } = props
  const { x, y } = useAtom($dot)
  return (
    <div
      className="Dot"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      {...rest}
    />
  )
}

export default Dot
