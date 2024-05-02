import React from "react";
import { atom } from "xoid";
import { useAtom, useSetup } from '@xoid/react'
import Counter from "./Counter";

export default function XoidCounters() {
  const $atom = useSetup(() => CountersModel(initialState));
  const counters = useAtom($atom);
  const { addCounter, incrementCounter, resetCounter } = $atom.actions;

  return (
    <>
      <button onClick={addCounter}>add counter</button>
      {counters.map(({ id, count }) => (
        <Counter
          key={id}
          id={id}
          count={count}
          onIncrement={incrementCounter}
          onReset={resetCounter}
        />
      ))}
    </>
  );
}

const initialState = {
  nextId: 0,
  counters: []
};

const CountersModel = ({ counters, nextId }) =>
  atom(counters, (a) => {
    const getCountAtomById = (id) => {
      const index = a.value.findIndex((counter) => counter.id === id);
      return a.focus((s) => s[index].count);
    };

    return {
      addCounter: () => {
        a.focus((s) => s[nextId]).set({ id: nextId, count: 0 });
        nextId++;
      },
      incrementCounter: (id) => getCountAtomById(id).update((s) => s + 1),
      resetCounter: (id) => getCountAtomById(id).set(0)
    };
  });
