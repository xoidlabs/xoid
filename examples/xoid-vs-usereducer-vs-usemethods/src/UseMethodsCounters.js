import React from "react";
import useMethods from "use-methods";
import Counter from "./Counter";

export default function UseMethodsCounters() {
  const [
    { counters },
    { addCounter, incrementCounter, resetCounter }
  ] = useMethods(methods, initialState);

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

const methods = state => {
  const getCounter = id => state.counters.find(counter => counter.id === id);

  return {
    addCounter() {
      state.counters.push({ id: state.nextId++, count: 0 });
    },
    incrementCounter(id) {
      getCounter(id).count++;
    },
    resetCounter(id) {
      getCounter(id).count = 0;
    }
  };
};
