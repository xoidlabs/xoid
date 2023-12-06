import {
  INTERNAL,
  register,
  Atom,
  atomMap,
  $registry,
  createPathMembrane,
  current,
  plugins,
  internal,
} from './utils'

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

  plugins.push((atom: any) => {
    // devtools support
    Object.defineProperty(atom, 'debugValue', {
      configurable: true,
      set(debugValue: string) {
        const internal = atom[INTERNAL]
        internal.debugValue = debugValue
        register(debugValue, atom)
      },
    })
  })

  internal.send = (atom: Atom) => {
    const internal = atom[INTERNAL]
    const debugValue = internal.debugValue
    if (debugValue) {
      const id = atomMap[debugValue].map.get(atom)
      const regKey = id ? `${debugValue}-${id}` : debugValue
      $registry.focus((s) => s[regKey]).set(internal.get())
    }
  }

  internal.wrap = (item, atom) => {
    const { debugValue } = atom[INTERNAL]
    return debugValue ? createPathMembrane(item, [], atom) : item
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
