import { atom, setup, inject } from 'xoid'

// A recursive function that retrieves a value from a nested object using a path of keys.
export function getIn(obj: any, path: string[], cache = false, index = 0): any {
  if (index === path.length) return obj
  const key = path[index]
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], path, cache, index + 1)
}

export function feature(fn) {
  return (...args) => {
    // TODO: safe get this.
    let maybe = inject(fn)
    if (!maybe) {
      maybe = fn(...args)
      provide(fn, maybe)
    }
    return maybe
  }
}

// () => inject(fn)
// () => provide(fn, item)
// () => fn()
const CommonSymbol = Symbol()

const $mouseMoveFeature = feature(() =>
  atom.call((fn) => {
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  })
)

setup.call(CommonSymbol, aFeature)

const aFeature = feature(() => {
  const $mouseMove = $mouseMoveFeature()
})
