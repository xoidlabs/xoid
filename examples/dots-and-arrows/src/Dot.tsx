import { useAtom } from '@xoid/react'
import { DotAtom } from './models'

const Dot = (props: { atom: DotAtom }) => {
  const { x, y, id } = useAtom(props.atom)
  return (
    <div
      className="Dot"
      // onClick={(e) => {
      //   use(temporaryArrowStore).arrowCreator({ x, y, id })
      //   e.stopPropagation()
      // }}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    ></div>
  )
}

export default Dot
