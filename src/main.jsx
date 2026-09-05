import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

function Test() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Flewt Router is working</h1>
      <p>React and BrowserRouter have mounted successfully.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Test />
    </BrowserRouter>
  </React.StrictMode>
);
