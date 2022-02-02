import React from "react";
import ReactDOM from "react-dom";
import UseReducerCounters from "./UseReducerCounters";
import UseMethodsCounters from "./UseMethodsCounters";
import XoidCounters from "./XoidCounters";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <section>
        <h2>xoid</h2>
        <XoidCounters />
      </section>
      <section>
        <h2>useReducer</h2>
        <UseReducerCounters />
      </section>
      <section>
        <h2>useMethods</h2>
        <UseMethodsCounters />
      </section>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
