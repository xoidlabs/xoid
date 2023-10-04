---
id: performance-optimizations
title: Performance optimizations
---

## Lazy evaluation

Atoms are lazily evaluated. If an atom is created using a *state initializer function*, this function won't run until the `.value` getter is read, or the atom is subscribed for the first time.

```js
const $atom = create(() => {
  console.log('I am lazily evaluated!')
  return expensiveComputation(25)
})
// nothing's logged on the console yet

console.log($atom.value)
// Console: "I am lazily evaluated!"
// Console: 25

console.log($atom.value)
// Console: 25
```
You can make use of this feature to avoid expensive computations where possible.

## Lazy evaluation in derived atoms

A derived atom is not much different than a classical atom. Still, its state initializer function will wait for the atom's value to be requested in order to run. 

```js
const $alpha = create(3)
const $beta = create(5)

const $sum = create((read) => {
  console.log('Evaluation occured')
  return read($alpha) + read($beta)
})
// nothing's logged on the console yet
```

Later, when it's consumed for the first time:

```js
console.log($sum.value)
// Console: "Evaluation occured"
// Console: 8

console.log($sum.value)
// Console: 8
```

## Dependency collection in derived atoms

**Dependency collection** is another performance optimization that makes lazy evaluation much more advanced.
When an atom is evaluated, it collects its latest dependencies. Since the `$sum` is evaluated at least once in our previous example, it's now "aware" that it's dependencies are `$alpha` and `$beta`. Let's observe what will happen when those dependencies are updated:

```js
$alpha.set(30)
$alpha.update((s) => s + 1)
$beta.set(1000)
// nothing's logged on the console yet

console.log($sum.value)
// Console: "Evaluation occured"
// Console: 1031

console.log($sum.value)
// Console: 1031
```

Observe that `$sum` knew that it needs to rerun its state initializer when it's `.value` is requested after the dependencies are changed. This can happen thanks to **dependency collection**. `$sum` knows that its internal state is invalid without causing evaluation. It can avoid evaluation until it's essential.


## Lazy evaluation in atoms created with `.map` method

Same kind of performance optimizations apply to the atoms that are created using the `.map` method.

```js
const $count = create(() => {
  console.log('Ancestor atom evaluated')
  return 100
})

const $doubleCount = $count.map((value) => {
  console.log('Evaluation occured')
  return value * 2
})
// nothing's logged on the console yet

$count.update(s => s + 1)
// Console: "Ancestor atom evaluated"

console.log($doubleCount.value)
// Console: "Evaluation occured"
// Console: 202

console.log($doubleCount.value)
// Console: 202
```



> **xoid** supports special kind of atoms called "stream"s.
> A stream is "an atom that may or may not have an immediate value". Lazy evaluation works slightly different in a "stream". See the [next section](streams) for more.