import { Atom as $Atom, create } from 'xoid'

export const { plugins, internal } = create as typeof create & {
  internal: {
    readonly symbol: unique symbol
    devtools: {
      send: (atom: Atom) => void
      wrap: <T>(value: T, atom: Atom) => T
    }
  }
}

export const INTERNAL: unique symbol = (internal as any).symbol

export type Atom = $Atom<any> & { debugValue: string; [INTERNAL]: any }

const nodot = (s: string) => {
  return s.replace('.', '\\.')
}

const shorten = (s: string) => {
  return s.length < 14 ? nodot(s) : nodot(s.slice(0, 3)) + '..' + nodot(s.slice(-3))
}

function isEligible(o: any) {
  return (
    o === Object(o) &&
    ['[object Object]', '[object Function]', '[object AsyncFunction]'].includes(
      Object.prototype.toString.call(o)
    )
  )
}

const calledTimesMap = new WeakMap()

export const atomMap: Record<string, { count: number; map: Map<Atom, number> }> = {}
const $registry = create<Record<string, unknown>>({})
export const register = (key: string, atom: Atom) => {
  if (!atomMap[key]) atomMap[key] = { count: -1, map: new Map<Atom, number>() }
  let id = atomMap[key].map.get(atom)
  if (!id) {
    id = ++atomMap[key].count
    atomMap[key].map.set(atom, id)
  }
  $registry.update((s) => {
    const registry = { ...s }
    if (!registry[key]) registry[key] = {} as (typeof registry)[string]
    registry[id ? `${key}-${id}` : key] = atom[INTERNAL].get()
    return registry
  })
}

const defaultAction = () => ({ type: `Update - ${window.performance.now().toFixed(2)}` })
export const current = { action: defaultAction }

const notify = (value: any) => (current.action = value ? () => value : defaultAction)

// This function is a little bit large.
// Particularly it's because it tries to detect and display async functions.
export const createPathMembrane = (obj: any, path: string[] = [], atom: Atom): any => {
  if (!isEligible(obj)) return obj

  return new Proxy(obj, {
    get: (target, key) => {
      if (target[INTERNAL]) return target[key]
      if (!isEligible(target[key])) return target[key]
      const nextPath = path.map((i) => i)
      nextPath.push(key as string)
      return createPathMembrane(obj[key], nextPath, atom)
    },
    apply(target, thisArg, args) {
      const { debugValue } = atom[INTERNAL]
      const id = atomMap[debugValue].map.get(atom)
      const regKey = id ? `${debugValue}-${id}` : debugValue
      const action = {
        type: `(${regKey}).${path?.map(nodot).map(shorten).join('.')}`,
      }

      const isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]'
      if (isAsync) {
        ;(action as any).async = true
        let attemptTimes = calledTimesMap.get(target)
        if (!attemptTimes) {
          attemptTimes = { i: 0 }
          calledTimesMap.set(target, attemptTimes)
        }
        attemptTimes.i++
        action.type = action.type + ' #' + attemptTimes.i
      }
      notify({ ...action, payload: args })
      const result = Reflect.apply(target, thisArg, args)
      // @ts-ignore
      if (isAsync) result.then(() => notify({ ...action, end: true }))
      else notify(undefined)

      return result
    },
  })
}

export { $registry }
