import React, { useState } from "react";
import { use } from "xoid";
import useItems from "./useItems";
import Counter from "./Counter";

export default function App() {
  const [value, onChange] = useState([]);
  const { add, getActions } = useItems({
    value,
    onChange,
    getInitialState: (id) => ({ id, count: 0 }),
    getActions: (atom) => {
      const $count = use(atom, (s) => s.count);
      return {
        increment: () => $count((s) => s + 1),
        reset: () => $count(0)
      };
    }
  });

  return (
    <>
      <button onClick={add}>add counter</button>
      {value.map(({ id, count }) => {
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
