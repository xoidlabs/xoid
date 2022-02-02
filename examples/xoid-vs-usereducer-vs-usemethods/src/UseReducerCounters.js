import React, { useReducer } from "react";
import Counter from "./Counter";

export default function UseReducerCounters() {
  const [{ counters }, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <button onClick={() => dispatch({ type: "ADD_COUNTER" })}>
        add counter
      </button>
      {counters.map(({ id, count }) => (
        <Counter
          key={id}
          count={count}
          onIncrement={() => dispatch({ type: "INCREMENT_COUNTER", id })}
          onReset={() => dispatch({ type: "RESET_COUNTER", id })}
        />
      ))}
    </>
  );
}

const initialState = {
  nextId: 0,
  counters: []
};

const reducer = (state, action) => {
  let { nextId, counters } = state;
  const replaceCount = (id, transform) => {
    const index = counters.findIndex(counter => counter.id === id);
    const counter = counters[index];
    return {
      ...state,
      counters: [
        ...counters.slice(0, index),
        { ...counter, count: transform(counter.count) },
        ...counters.slice(index + 1)
      ]
    };
  };

  switch (action.type) {
    case "ADD_COUNTER": {
      nextId = nextId + 1;
      return {
        nextId,
        counters: [...counters, { id: nextId, count: 0 }]
      };
    }
    case "INCREMENT_COUNTER": {
      return replaceCount(action.id, count => count + 1);
    }
    case "RESET_COUNTER": {
      return replaceCount(action.id, () => 0);
    }
  }
};
