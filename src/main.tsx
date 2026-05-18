import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
/* Initialize i18next before any component mounts so translations are
 * available on first render. The module is side-effect imported. */
import "./app/i18n";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
