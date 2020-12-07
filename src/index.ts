import { create, get, set, use, subscribe, objectOf, arrayOf } from './core'
import { useStore } from './react'
export { create, get, set, use, subscribe, objectOf, arrayOf, useStore }

const xoid = Object.assign(create, {
  create,
  get,
  set,
  use,
  subscribe,
  objectOf,
  arrayOf,
  useStore,
})

export default xoid
