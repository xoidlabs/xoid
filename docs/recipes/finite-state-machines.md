---
id: finite-state-machines
title: Finite State Machines
---

**xoid** is **not** specialized for **fsm**s (finite state machines), however, a considerable range of fsms can be expressed only by using the first argument of `create` function.

```js
const fsm = create<{
  name: string;
  actions: Record<'melt' | 'freeze' | 'condense' | 'vaporize', () => void>;
}>((_get, set) => {

  function melt() {
    set(liquid)
    console.log('I melted')
  }

  function freeze() {
    set(solid)
    console.log('I freezed')
  }

  function condense() {
    set(liquid)
    console.log('I condensed')
  }

  function vaporize() {
    set(gas)
    console.log('I vaporized')
  }

  const solid = { name: "ice", actions: { melt } };
  const liquid = { name: "water", actions: { freeze, vaporize } };
  const gas = { name: "vapor", actions: { condense } };

  return solid;
})

const Water = () => {
  const [{ name, actions }] = useStore(fsm)
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