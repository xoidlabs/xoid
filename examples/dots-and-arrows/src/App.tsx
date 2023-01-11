import './styles.css'
import React from 'react'
import { useAtom, useSetup } from '@xoid/react'
import { create, use } from 'xoid'
import Dot from './components/Dot'
import Arrow from './components/Arrow'
import ModulateButton from './components/ModulateButton'
import TemporaryArrow from './components/TemporaryArrow'
import { DotType, ArrowType, TemporaryArrowModel } from './models'

const $atom = create<{
  dots: Record<string, DotType>
  arrows: Record<string, ArrowType>
}>({
  dots: {
    aaa: { x: 60, y: 10 },
    bbb: { x: 110, y: 100 },
    ccc: { x: 30, y: 100 },
  },
  arrows: {
    yyy: { from: 'aaa', to: 'bbb' },
  },
})

const randomString = () => Math.random().toString()

const createDot = (x: number, y: number) =>
  $atom.focus('dots').update((s) => ({ ...s, [randomString()]: { x, y } }))

export default function App() {
  const { dots, arrows } = useAtom($atom)
  const $temporaryArrow = useSetup(() =>
    TemporaryArrowModel({
      onEndArrow: (arrow) =>
        $atom.focus('arrows').update((s) => ({ ...s, [randomString()]: arrow })),
    })
  )
  return (
    <div className="App" onClick={(e) => createDot(e.clientX, e.clientY)}>
      {Object.keys(dots).map((key) => (
        <Dot
          key={key}
          $dot={$atom.focus((s) => s.dots[key])}
          onClick={(e) => {
            $temporaryArrow.actions.startOrEndArrow(key)
            e.stopPropagation()
          }}
        />
      ))}
      {Object.keys(arrows).map((key) => (
        <Arrow
          key={key}
          $arrow={$atom.focus((s) => s.arrows[key])}
          $dots={$atom.focus((s) => s.dots)}
        />
      ))}
      <TemporaryArrow $dots={$atom.focus('dots')} $temporaryArrow={$temporaryArrow} />
      <ModulateButton $dots={$atom.focus('dots')} />
    </div>
  )
}
