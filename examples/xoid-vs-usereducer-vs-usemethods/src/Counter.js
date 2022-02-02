import React, { memo } from "react";

export default memo(Counter);

function Counter({ id, count, onIncrement, onReset }) {
  return (
    <div>
      {count}
      <button onClick={() => onIncrement(id)}>+</button>
      <button onClick={() => onReset(id)}>x</button>
    </div>
  );
}
