import { renderToString } from "react-dom/server"
import { App } from "./App"
import { faq } from "./content"

export const render = () => renderToString(<App />)
export { faq }
