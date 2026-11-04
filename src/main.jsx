import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
//import aos ainmation
import "aos/dist/aos.css";
import AOS from "aos";
AOS.init();
import { startOfflineSync } from "./lib/offline";
import { refreshProfile } from "./lib/api";
startOfflineSync();
refreshProfile();
window.addEventListener("online", refreshProfile);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
