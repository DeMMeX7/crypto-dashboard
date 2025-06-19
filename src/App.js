// src/App.js
import React from "react";
import Dashboard from "./components/Dashboard";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Dashboard</h1>
      </header>
      <div className="main-content-wrapper">
        {" "}
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
