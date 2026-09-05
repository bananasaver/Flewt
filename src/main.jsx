import React from "react";
import ReactDOM from "react-dom/client";

function Test() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Flewt React is working</h1>
      <p>React has mounted successfully.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Test />
);
