import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";

// Force reset body to block layout - override Tailwind v4 preflight
// Tailwind v4's @layer base injects display:flex/place-items:center on body
// which causes auth pages to overflow/clip. This is the only reliable fix.
document.documentElement.style.cssText = "height: auto; min-height: 100vh;";
document.body.style.cssText =
  "margin: 0; padding: 0; display: block; min-height: 100vh; background-color: #f5f5f5; overflow-x: hidden;";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
