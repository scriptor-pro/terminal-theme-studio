import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./styles.css"
import "./footix-footer.js"

// The build pre-renders the default theme into #root for crawlers (scripts/prerender.mjs).
// We render instead of hydrating: a palette saved in localStorage would not match that HTML.
createRoot(document.getElementById("root")!).render(<App />)
