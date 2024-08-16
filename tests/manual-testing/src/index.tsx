// import { reactive } from '@xoid/reactive'

// class Anonymous {}

// const Reactive = new Proxy(Anonymous, {
//   construct(a, b) {
//     const obj = Object.create(reactive({}))
//     return reactive(obj)
//   },
//   apply() {
//     return 4
//   },
// }) as {
//   (): number
//   new (): {}
// }

// class System extends Reactive {
//   count = 0
//   inc() {
//     this.count++
//   }
// }
// const instance = new System()
// console.log(instance)
// console.log(instance.count)
// instance.inc()
// console.log(instance.count)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const reactRoot = ReactDOM.createRoot(document.getElementById('root'))
reactRoot.render(<App />)
