---
id: finite-state-machines
title: Finite state machines
---

In **xoid**, a wide range of FSMs can be expressed only by using only the `create` function.

```js
const createFsm = () => {
  function melt() {
    store(liquid)
    console.log('I melted')
  }

  function freeze() {
    store(solid)
    console.log('I freezed')
  }

  function condense() {
    store(liquid)
    console.log('I condensed')
  }

  function vaporize() {
    store(gas)
    console.log('I vaporized')
  }

  const solid = { name: "ice", actions: { melt } };
  const liquid = { name: "water", actions: { freeze, vaporize } };
  const gas = { name: "vapor", actions: { condense } };

  const store = create(solid)
  return store;
}

const Water = () => {
  const fsm = useSetup(createFsm)
  const { name, actions } = useStore(fsm)
  return (
    <div>
      {name}
      {Object.keys(actions).map((key) => (
        <button key={key} onClick={actions[key]}>
          {key}
        </button>
      ))}
    </div>
  )
}
```