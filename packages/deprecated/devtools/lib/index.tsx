import { createNotifier, META, Atom, subscribe } from '@xoid/engine'

const snapshot = <T extends any>(store: Atom<T>) => store()

/**
 * Integration for [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
 */
export const devtools = <T extends any>(atom: Atom<T>, name?: string) => {
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
    return () => void 0
  }

  const dt = extension.connect({ name }) as any
  ;(atom as any)[META].devtoolsHelper = createDevtoolsHelper()
  const channel = ((atom as any)[META].devtoolsChannel = createNotifier())
  let currentAction: any
  // @ts-ignore
  const unsub0 = channel.subscribe((state: any) => {
    if (!state && currentAction) {
      dt.send(currentAction, snapshot(atom))
    }
    currentAction = state
    if (state && state.async) {
      const modifier = state.end ? ' (end)' : ''
      dt.send({ ...state, type: state.type + modifier }, snapshot(atom))
      currentAction = undefined
    }
  })

  let isTimeTraveling = false
  const unsub1 = subscribe(atom, () => {
    if (isTimeTraveling) {
      isTimeTraveling = false
    } else {
      const now = window.performance.now().toFixed(2)
      const action = currentAction && !currentAction.async ? currentAction : `Update (${now})`
      dt.send(action, snapshot(atom))
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
      atom(nextValue)
    } else if (message.payload?.type === 'COMMIT') {
      dt.init(snapshot(atom))
    } else if (message.payload?.type === 'IMPORT_STATE') {
      const actions = message.payload.nextLiftedState?.actionsById
      const computedStates = message.payload.nextLiftedState?.computedStates || []

      isTimeTraveling = true

      computedStates.forEach(({ state }: { state: any }, index: number) => {
        const action = actions[index] || `Update - ${new Date().toLocaleString()}`
        atom(state)
        if (index === 0) dt.init(snapshot(atom))
        else dt.send(action, snapshot(atom))
      })
    }
  })
  dt.init(snapshot(atom))
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
  const getAddress = (store: any, obj: any, actionAddress: string[] = []): any => {
    if (!isEligible(obj)) return obj

    return new Proxy(obj, {
      get: (target, prop) => {
        if (prop === META) return target[META]
        if (!isEligible(target[prop])) return target[prop]
        const newActionAddress = actionAddress.map((i) => i)
        newActionAddress.push(prop as string)
        return getAddress(store, obj[prop], newActionAddress)
      },
      apply(target, thisArg, args) {
        if (target[META] || !store[META].devtoolsChannel)
          return Reflect.apply(target, thisArg, args)
        const storeAddress = store[META]?.address?.slice(1).map(shorten)
        const begin = storeAddress?.length ? `(*.${storeAddress.join('.')})` : '*'
        const isAsync = Object.prototype.toString.call(target) === '[object AsyncFunction]'

        const action = {
          type: `${begin}.${actionAddress.map(nodot).join('.')}`,
        }
        if (isAsync) {
          // @ts-ignore
          action.async = true
          let attemptTimes = calledTimesMap.get(target)
          if (!attemptTimes) {
            attemptTimes = { i: 0 }
            calledTimesMap.set(target, attemptTimes)
          }
          attemptTimes.i++
          action.type = action.type + ' #' + attemptTimes.i
        }
        store[META].devtoolsChannel.notify({ ...action, args })
        const result = Reflect.apply(target, thisArg, args)
        if (isAsync) result.then(() => store[META].devtoolsChannel.notify({ ...action, end: true }))
        else store[META].devtoolsChannel.notify(undefined)

        return result
      },
    })
  }
  return getAddress
}

const shorten = (s: string) => {
  return s.length < 10 ? nodot(s) : nodot(s.slice(0, 3)) + '..' + nodot(s.slice(-3))
}
const nodot = (s: string) => {
  return s.replace('.', '\\.')
}

const calledTimesMap = new WeakMap()
