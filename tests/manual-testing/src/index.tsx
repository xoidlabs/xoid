import { create, computed, toReactive, reactive } from '@xoid/reactive'

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

class Anonymous {}

const Reactive = new Proxy(Anonymous, {
  construct(a, b) {
    const obj = Object.create(reactive({}))
    return reactive(obj)
  },
  apply() {
    return 4
  },
}) as {
  (): number
  new (): {}
}

class System extends Reactive {
  count = 0
  inc() {
    this.count++
  }
}
const instance = new System()
console.log(instance)
console.log(instance.count)
instance.inc()
console.log(instance.count)
