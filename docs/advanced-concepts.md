---
id: advanced-concepts
title: Advanced concepts
---

## Deriving state from external sources

With an additional overload of the `read` function, you can consume external (non-**xoid**) sources. This can be a Redux store, an RxJS observable, or anything that implements getState & subscribe pair. Here is an atom that derives its state from a Redux store:

```js
import store from './reduxStore'

const derivedAtom = create((read) => read(store.getState, store.subscribe))
```
As long as the external source implements a getState & subscribe, pair, it can be consumed by **xoid**.

## Enhanced atoms

An enhanced atom is an atom whose default `.set` method is swapped with something else. This technique can be used to create "pass through atoms" that act as a mediators. Most people using **xoid** will not need to write enhanced atoms. 
This naming is inspired by Redux's concept of enhancers. For a real-life scenario, see [Using in an existing Redux App](recipes/redux-interop).

```js
import store from './reduxStore'

const $mediator = create((read) => read(store.getState, store.subscribe))

// we swap the default`.set` method
$mediator.set = (value: number) => store.dispatch({ type: 'ACTION', payload: value })

$mediator.update(s => s + 1) // modifications to `$mediator` will be directly forwarded to Redux dispatch.
```
> Swapping `.set` also modifies the behavior of `.update`, because it uses `.set` internally. This is an intentional feature.
