import { create, computed } from '@xoid/reactive'

const $count = create(0)
const $derived = computed(() => {
  console.log('$derived run')
  return $count.value * 2
})
// const $computed = computed(() => $count.value * 2)

// ;(() => {
//   console.log($derived.value)
//   console.log($computed.value)

//   $count.value++

//   console.log($derived.value)
//   console.log($computed.value)
// })()

const $computed2 = computed(() => {
  console.log('$computed2 run')
  return $derived.value * 3
})

window.onclick = () => $count.value++
$computed2.subscribe(console.warn)

// console.log($computed2.value)
