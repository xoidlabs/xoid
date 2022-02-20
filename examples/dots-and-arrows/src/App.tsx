import React from 'react'
import Dot from './Dot'
import { create, use } from 'xoid'
import { useAtom } from '@xoid/react'
import './index.css'
import { DotModel } from './models'

// const temporaryArrowStore = create(
//   {
//     drawing: false,
//     temporaryArrow: ArrowModel({} as ArrowPayload),
//   },
//   (store) => {
//     window.addEventListener('mousemove', (e) => {
//       console.log('mv')
//       if (get(store.drawing)) {
//         set(store.temporaryArrow.to, {
//           x: e.clientX + 10,
//           y: e.clientY + 10,
//         })
//       }
//       // if (get(store.drawing)) {
//       //   set(store.temporaryArrow, {
//       //     from: get(store.temporaryArrow.from),
//       //     to: {
//       //       x: e.clientX,
//       //       y: e.clientY,
//       //     },
//       //   })
//       // }
//     })
//     return {
//       startArrow(dot: DotPayload) {
//         // set(store.temporaryArrow, { from: dot, to: dot })
//         // set(store.drawing, true)
//         // IMPORTANT: types should complain about this
//         set(store, {
//           temporaryArrow: { from: dot, to: dot },
//           drawing: true,
//         })
//       },
//       endArrow(dot: DotPayload) {
//         use(arrowsStore).add({ ...get(store.temporaryArrow), to: dot })
//         set(store.drawing, false)
//       },
//       arrowCreator(dot: DotPayload) {
//         if (get(store.drawing)) this.endArrow(dot)
//         else this.startArrow(dot)
//       },
//     }
//   }
// )

const $dots = create([], (atom) => ({
  createDot: (x: number, y: number) => {
    atom((s) => [...s, DotModel({ x, y, id: 0 })])
  },
}))

const App = () => {
  const dots = useAtom($dots)

  return (
    <div
      style={{ position: 'relative', width: '100vw', height: '100vh' }}
      onClick={(e) => use($dots).createDot(e.clientX, e.clientY)}
    >
      {dots.map((atom, key) => (
        <Dot atom={atom} key={key} />
      ))}
      {/* <div style={{ pointerEvents: 'none', position: 'absolute', width: '100vw', height: '100vh' }}>
        {arrowsStore.map((store, key) => (
          <Arrow store={store} key={key} />
        ))}
        {drawing && <Arrow store={temporaryArrowStore.temporaryArrow} />}
      </div> */}
    </div>
  )
}

export default App
