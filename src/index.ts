import {
  create,
  get,
  set,
  use,
  subscribe,
  objectOf,
  arrayOf,
  current,
} from './core'
import { useStore } from './react'
export {
  create,
  get,
  set,
  use,
  subscribe,
  objectOf,
  arrayOf,
  current,
  useStore,
}

const xoid = Object.assign(create, {
  create,
  get,
  set,
  use,
  subscribe,
  objectOf,
  arrayOf,
  current,
  useStore,
})

export default xoid
