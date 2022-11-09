---
id: effect
title: effect
---

## Lazy evaluation

Atoms are lazily evaluated. If a state initializer function is used, it won't be executed until the `.value` getter is read, or the atom is subscribed using `.subscribe`, or `.watch` for  the first time.
```js
const $atom = create(() => {
  console.log('I am lazy!')
  return expensiveComputation(25)
})
// nothing's logged on the console yet...
console.log($atom.value) 
// Console output: 
// "I am lazy!"
//  25
```

## Lazy evalutation in derived atoms

A derived atom can be created by using the callback argument of a state initializer function.

```js
import { alpha, beta } from './some-file'

const $sum = create((get) => get(alpha) + get(beta))
```
`$sum` atom is also lazily evaluated. Also, there's more to this. When the last listener of `$sum` unsubscribes, the atom goes back to idle mode, and its state initializer stops running. 

After the atom went back to idle, let's say we read the `.value` getter. If the dependencies aren't changed, we can still avoid an extra execution of the state initializer, because even though the atom is idle, it's aware of its dependencies (`alpha` and `beta`), because they are collected during the latest run.