import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";

// PUBLIC_INTERFACE
// This is the React entrypoint for the Vite app.
// It renders <App /> inside the #app container in index.html.
ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
