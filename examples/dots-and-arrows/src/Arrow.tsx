import { useAtom } from '@xoid/react'
import { ArrowAtom } from './models'

const Arrow = (props: { atom: ArrowAtom }) => {
  const { from, to } = useAtom(props.atom)
  return (
    <svg height="100%" width="100%" style={{ position: 'absolute' }}>
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

export default Arrow
