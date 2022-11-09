import { Atom as $Atom, create, use as _use } from '@xoid/development'

const use = _use as unknown as {
  devtools: {
    init: (atom: Atom, initialValue: unknown, isFunction: boolean) => void
    send: (atom: Atom) => void
    wrap: <T>(value: T, atom: Atom) => T
  }
}

const INTERNAL: unique symbol = (_use as any).symbol

type Atom = $Atom<any> & { debugValue: string; [INTERNAL]: any }

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

const atomMap: Record<string, { count: number; map: Map<Atom, number> }> = {}
const $registry = create<Record<string, unknown>>({})
const register = (key: string, atom: Atom, value: unknown) => {
  if (!atomMap[key]) atomMap[key] = { count: -1, map: new Map<Atom, number>() }
  let id = atomMap[key].map.get(atom)
  if (!id) {
    id = ++atomMap[key].count
    atomMap[key].map.set(atom, id)
  }
  $registry.update((s) => {
    const registry = { ...s }
    if (!registry[key]) registry[key] = {} as typeof registry[string]
    registry[id ? `${key}-${id}` : key] = value
    return registry
  })
}

const defaultAction = () => {
  return { type: `Update - ${window.performance.now().toFixed(2)}` }
}
const current = { action: defaultAction }

export const devtools = () => {
  let extension: any
  try {
    extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__
  } catch {}
  if (!extension) {
    if (
      typeof process === 'object' &&
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      console.warn('[Warning] Please install/enable Redux devtools extension')
    }
    return () => void 0
  }

  use.devtools.init = (atom, initialValue) => {
    register(atom[INTERNAL].debugValue, atom, initialValue)
  }

  use.devtools.send = (atom: Atom) => {
    const internal = atom[INTERNAL]
    const key = internal.debugValue
    if (key) {
      const id = atomMap[key].map.get(atom) as number
      $registry.focus((s) => s[id ? `${key}-${id}` : key]).set(internal.get())
    }
  }

  use.devtools.wrap = (item, atom) => {
    const { debugValue } = atom[INTERNAL]
    return debugValue ? createPathMembrane(item, [], atom) : item
  }

  const dt = extension.connect({ name: 'xoid' })
  let unsub: Function
  setTimeout(() => {
    dt.init($registry.value)
    unsub = $registry.subscribe((value) => {
      dt.send(current.action(), value)
    })
  })
  return () => unsub?.()
}

const notify = (value: any) => (current.action = value ? () => value : defaultAction)

const createPathMembrane = (obj: any, path: string[] = [], atom: Atom): any => {
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
      const isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]'

      const { debugValue } = atom[INTERNAL]
      const atomId = atomMap[debugValue].map.get(atom)
      const action = {
        type: `(${debugValue}${atomId ? '-' + atomId : ''}).${path
          ?.map(nodot)
          .map(shorten)
          .join('.')}`,
      }

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
      if (isAsync) result.then(() => notify({ ...action, end: true }))
      else notify(undefined)

      return result
    },
  })
}
