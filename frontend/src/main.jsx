import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./App.css";
import "./styles/login.css";
import "./styles/dashboard.css";
import "./styles/execution.css";
import "./styles/manager.css";
import "./styles/deals.css";
import "./styles/reporting.css";
import "./styles/administration.css";
import "./styles/responsive.css";

import App from "./App.jsx";

// Mount the React app into Vite's root element.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
