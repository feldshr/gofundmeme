import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Services from "./services";
import { Router } from "./components/Router/Router";

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Services>
        <Router />
      </Services>
    </StrictMode>,
  );
}
