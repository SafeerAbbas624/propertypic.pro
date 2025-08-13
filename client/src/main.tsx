import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Firebase configuration from environment variables
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn("Firebase configuration missing. Media uploads may not work properly.");
}

createRoot(document.getElementById("root")!).render(<App />);
