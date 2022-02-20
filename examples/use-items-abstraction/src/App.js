import React from "react";
import { use } from "xoid";
import useItems from './useItems'
import Counter from "./Counter";

export default function App() {
  const [items, { add, getActions }] = useItems({
    items: [],
    getInitialState: (id) => ({ id, count: 0 }),
    getActions: (atom) => {
      const $count = use(atom, (s) => s.count);
      return {
        increment: () => $count((s) => s + 1),
        reset: () => $count(0)
      };
    }
  });
  const { value, onChange } = props
  const atom = useSetup(CustomModel, [value, onChange])
  
  return (
    <>
      <button onClick={add}>add counter</button>
      {items.map(({ id, count }) => {
        const { increment, reset } = getActions(id);
        return (
          <Counter
            key={id}
            id={id}
            count={count}
            onIncrement={increment}
            onReset={reset}
          />
        );
      })}
    </>
  );
}
