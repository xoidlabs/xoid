import { useAtom } from '@xoid/react'
import { Ref } from 'xoid'
import React from 'react'
import { DotType } from '../models'

const Dot = (props: { $dot: Ref<DotType> } & React.ComponentProps<'div'>) => {
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
