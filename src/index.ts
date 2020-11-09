import {
  createStore,
  createModel,
  get,
  set,
  use,
  subscribe,
  parent,
  config,
} from './core'
import { useStore } from './react'

export {
  createStore,
  createModel,
  get,
  set,
  use,
  subscribe,
  useStore,
  parent,
  config,
}

const xoid = {
  createStore,
  createModel,
  get,
  set,
  use,
  subscribe,
  useStore,
  parent,
  config,
}

export default xoid

export type {
  Model,
  Store,
  Abstract,
  Initializer,
  XGet,
  InitSet,
  After, // StateOf // ActionsOf
} from './core/types'
