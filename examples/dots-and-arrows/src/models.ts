import { create } from 'xoid'

type DotPayload = { x: number; y: number; id?: number }

export const DotModel = (payload: DotPayload) =>
  create(payload, (atom) => {
    // setInterval(() => use(atom).animate(), 200)
    // return {
    //   animate: () => {
    //     set(atom.x, (state) => state + 0.25)
    //     set(atom.y, (state) => state + 0.25)
    //   },
    // }
  })

type ArrowPayload = {
  from: DotPayload
  to: DotPayload
  startId?: number
  endId?: number
}

const ArrowModel = ({ from, to, startId, endId }: ArrowPayload) =>
  create({
    from: startId ? create((get) => get(dotsStore[startId])) : from,
    to: endId ? create((get) => get(dotsStore[endId])) : to,
  })
