import { INTERNAL, TOOLS } from 'xoid/debug'
import { register, atomMap, $registry, createPathMembrane, current, plugins } from './utils'
import { AtomImpl } from 'xoid/atom/atom'

export { $registry }

const devtools = (instanceName = 'xoid') => {
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

  Object.defineProperty(AtomImpl.prototype, 'debugValue', {
    configurable: true,
    set(debugValue: string) {
      register(debugValue, this)
    },
  })

  // @ts-ignore: TODO
  TOOLS.send = (atom: AtomImpl) => {
    const internal = atom[INTERNAL]
    const debugValue = internal.debugValue
    if (debugValue) {
      const id = atomMap[debugValue].map.get(atom)
      const regKey = id ? `${debugValue}-${id}` : debugValue
      $registry.focus((s) => s[regKey]).set(internal.get())
    }
  }

  TOOLS.wrap = (item, atom) => {
    const { debugValue } = atom[INTERNAL]
    return debugValue ? createPathMembrane(item, [], atom as any) : item
  }

  const dt = extension.connect({ name: instanceName })
  let unsub: Function
  // Suppress all sync updates initially, because $registry is being filled
  setTimeout(() => {
    dt.init($registry.value)
    unsub = $registry.subscribe((value) => {
      dt.send(current.action(), value)
    })
  })
  return () => unsub?.()
}
export default devtools
