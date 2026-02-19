import { createRoot } from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css";

// Initialize React app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
