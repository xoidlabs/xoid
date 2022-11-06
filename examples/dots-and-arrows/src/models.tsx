import { create } from 'xoid'

export type DotType = { x: number; y: number }
export type ArrowType = { from: string; to: string }
export type BaseArrowType = { from: DotType; to: DotType }

let isArrowPending = false
export const $mousePositionDot = create(undefined as DotType | undefined)
window.addEventListener('mousemove', (e) => {
  if (!isArrowPending) $mousePositionDot.set(undefined)
  $mousePositionDot.set({ x: e.clientX, y: e.clientY })
})

export const TemporaryArrowModel = (props: { onEndArrow: (value: ArrowType) => void }) =>
  create(undefined as { from: string; to?: string } | undefined, (atom) => {
    const startArrow = (id: string) => {
      isArrowPending = true
      atom.set({ from: id })
    }
    const endArrow = (id: string) => {
      isArrowPending = false
      props.onEndArrow({ from: atom.value!.from, to: id })
      atom.set(undefined)
    }

    const startOrEndArrow = (id: string) => {
      if (!isArrowPending) startArrow(id)
      else endArrow(id)
    }

    const abortArrow = () => {
      isArrowPending = false
      atom.set(undefined)
    }
    window.addEventListener('keydown', abortArrow)

    return { startOrEndArrow }
  })
