---
id: finite-state-machines
title: Finite state machines
---

With **xoid**, a wide range of finite state machines can be expressed.

```js
const createMachine = () => {
  function melt() {
    machine.set(liquid)
    console.log('I melted')
  }

  function freeze() {
    machine.set(solid)
    console.log('I freezed')
  }

  function condense() {
    machine.set(liquid)
    console.log('I condensed')
  }

  function vaporize() {
    machine.set(gas)
    console.log('I vaporized')
  }

  const solid = { name: "ice", actions: { melt } };
  const liquid = { name: "water", actions: { freeze, vaporize } };
  const gas = { name: "vapor", actions: { condense } };

  const machine = create(solid)
  return store;
}

const App = () => {
  const { name, actions } = useStore(createMachine)
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