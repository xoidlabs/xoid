import { atom, effect, inject, feature, setup } from 'xoid'

const $startFeature = feature(() => atom(['pointerdown']))
const $endFeature = feature(() => atom(['pointerup']))
const $moveFeature = feature(() => atom(['pointermove']))

const $isDraggingFeature = feature(() => {
  const [$start, $end, $move] = [$startFeature, $endFeature, $moveFeature].map(inject)
  const $isDragging = atom(false)
  let to

  effect(() => {
    $start.subscribe((e) => {
      to = setTimeout(() => {
        $isDragging.value = true
        to = null
      }, 400)
    })

    $end.subscribe(() => {
      $isDragging.value = false
      clearTimeout(to)
    })

    $move.subscribe(fn)
  })

  return $isDragging
})

const dispose = setup(() => {
  const $isDragging = inject($isDraggingFeature)
  return {}
})
