//@ts-ignore
import { createRoot, META, subscribe } from '@xoid/engine'
//@ts-ignore
import type { Observable } from '@xoid/engine'

const snapshot = <T extends any>(store: Observable<T>) => store()

/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
export const devtools = <T extends any>(store: Observable<T>, name?: string) => {
  // borrowed heavily from https://github.com/pmndrs/valtio/blob/main/src/utils/devtools.ts
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
    return
  }

  const dt = extension.connect({ name })
  store[META].root.devtoolsHelper = createDevtoolsHelper()
  const channel = (store[META].root.devtoolsChannel = createRoot())
  let currentAction: any
  const unsub0 = channel.subscribe((state: any) => {
    if (!state && currentAction) {
      dt.send(currentAction, snapshot(store))
    }
    currentAction = state
    if (state && state.async) {
      const modifier = state.end ? ' (end)' : ''
      dt.send({ ...state, type: state.type + modifier }, snapshot(store))
      currentAction = undefined
    }
  })

  let isTimeTraveling = false
  const unsub1 = subscribe(store, () => {
    if (isTimeTraveling) {
      isTimeTraveling = false
    } else {
      const now = window.performance.now().toFixed(2)
      const action = currentAction && !currentAction.async ? currentAction : `Update (${now})`
      dt.send(action, snapshot(store))
      currentAction = undefined
    }
  })
  const unsub2 = dt.subscribe((message: { type: string; payload?: any; state?: any }) => {
    if (message.type !== 'DISPATCH') return
    if (message.state) {
      if (message.payload?.type === 'JUMP_TO_ACTION' || message.payload?.type === 'JUMP_TO_STATE') {
        isTimeTraveling = true
      }
      const nextValue = JSON.parse(message.state)
      store(nextValue)
    } else if (message.payload?.type === 'COMMIT') {
      dt.init(snapshot(store))
    } else if (message.payload?.type === 'IMPORT_STATE') {
      const actions = message.payload.nextLiftedState?.actionsById
      const computedStates = message.payload.nextLiftedState?.computedStates || []

      isTimeTraveling = true

      computedStates.forEach(({ state }: { state: any }, index: number) => {
        const action = actions[index] || `Update - ${new Date().toLocaleString()}`
        store(state)
        if (index === 0) dt.init(snapshot(store))
        else dt.send(action, snapshot(store))
      })
    }
  })
  dt.init(snapshot(store))
  return () => {
    unsub0()
    unsub1()
    unsub2()
  }
}

function isEligible(o: any) {
  return (
    o === Object(o) &&
    ['[object Object]', '[object Function]', '[object AsyncFunction]'].includes(
      Object.prototype.toString.call(o)
    )
  )
}
const createDevtoolsHelper = () => {
  const getAddress = (store: any, obj: any, actionAddress: any): any => {
    if (!isEligible(obj)) return obj

    return new Proxy(obj, {
      get: (target, prop) => {
        if (prop === META) return target[META]
        if (!isEligible(target[prop])) return target[prop]
        return getAddress(store, obj[prop], [...actionAddress, prop])
      },
      apply(target, thisArg, args) {
        if (target[META] || !store[META].root.devtoolsChannel)
          return Reflect.apply(target, thisArg, args)
        const storeAddress = store[META].address.slice(1)
        const begin = storeAddress.length ? `(*.${storeAddress.join('.')})` : '*'
        const isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]'

        const action = { type: `${begin}.${actionAddress.join('.')}` }
        if (isAsync) {
          (action as any).async = true
          let attemptTimes = calledTimesMap.get(target)
          if (!attemptTimes) {
            attemptTimes = { i: 0 }
            calledTimesMap.set(target, attemptTimes)
          }
          attemptTimes.i++
          action.type = action.type + ' #' + attemptTimes.i
        }
        store[META].root.devtoolsChannel.notify({ ...action, args })
        const result = Reflect.apply(target, thisArg, args)
        if (isAsync)
          result.then(() => store[META].root.devtoolsChannel.notify({ ...action, end: true }))
        else store[META].root.devtoolsChannel.notify(undefined)

        return result
      },
    })
  }
  return getAddress
}

const calledTimesMap = new WeakMap()
