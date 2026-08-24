import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { MasterplanView } from "./MasterplanView";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MasterplanView />
  </StrictMode>,
);
