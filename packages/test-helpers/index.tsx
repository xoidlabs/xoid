export const debug = (store: any) => {
  const v = {
    self: store,
    selfSerialized: JSON.stringify(store),
    selfTypeof: typeof store,
    selfKeys: isNonPrimitiveStore(store)
      ? Object.keys(store)
      : '[[non-object]]',
    selfSpread: isNonPrimitiveStore(store) ? { ...store } : '[[non-object]]',
    get: store(),
    getSerialized: JSON.stringify(store()),
    getTypeof: typeof store(),
  }
  return v
}

const isNonPrimitiveStore = (store: any) => {
  const value = store()
  return (
    typeof store === 'function' &&
    (typeof value === 'object' || typeof value === 'function')
  )
}
