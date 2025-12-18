import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add error handling for general errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

console.log('Starting KrishiRakshak application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<App />);
