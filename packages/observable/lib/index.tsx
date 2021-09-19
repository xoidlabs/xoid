import { createRoot, createSelector, createTarget, META, Init, Observable } from '@xoid/engine'

export { subscribe, effect } from '@xoid/engine'
export type { Init, Observable, Listener, StateOf } from '@xoid/engine'

export const observable = <T extends any>(init: Init<T>): Observable<T> => {
  const isFunction = typeof init === 'function'
  const meta = { root: createRoot(), node: init }
  const target = createTarget(meta)
  const obj = Object.assign(target, { [META]: meta })
  if (isFunction) createSelector((obj as unknown) as Observable<T>, init)
  return obj as any
}
