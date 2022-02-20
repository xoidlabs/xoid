- redux mediator model
- redux model
- class component model
- pairmodel


```js
create(init, null, () => onChange)
```
- react funnel


Interact any "stateful" structure as if it's a **xoid** atom.

In React, a "value-onChange pair" is the most intuitive way of sharing state. Passing a value-onChange pair as a prop is a very common practice. A "state-setState pair" is just another type of it. It's the same, but it's for local component state. It can also be passed down to child components just like a value-onChange. Its setter function has slightly different characteristics.

There's nothing wrong with this pair. In this article however, I'll mention a case wher
working with immutability and how **xoid** can help you write simpler actions.


```js
const PairModel = (atom, ) => create(
    (get) => get(atom, 'value'), 
    null, 
    () => (value) => atom().onChange(value)
  )

// inside React
const atom = useSetup(PairModel, { value, onChange })
const setAlpha = use(atom, (s) => s.deep.alpha)
const setBeta = use(atom, (s) => s.deep.beta)

