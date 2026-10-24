// Injects the server-rendered app and the FAQ JSON-LD into dist/index.html,
// so crawlers that don't run JavaScript still get the full page.
import { readFile, rm, writeFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"

const ssrDir = resolve("dist-ssr")
const htmlPath = resolve("dist/index.html")
const { render, faq } = await import(pathToFileURL(resolve(ssrDir, "entry-server.js")).href)

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
}
// Escape "<" so no answer text can close the <script> element.
const faqScript = `<script type="application/ld+json">${JSON.stringify(faqJsonLd).replace(/</g, "\\u003c")}</script>`

let html = await readFile(htmlPath, "utf-8")
for (const marker of ['<div id="root"></div>', "<!--faq-jsonld-->"]) {
  if (!html.includes(marker)) throw new Error(`prerender: marker ${marker} not found in dist/index.html`)
}
html = html.replace('<div id="root"></div>', () => `<div id="root">${render()}</div>`).replace("<!--faq-jsonld-->", () => faqScript)
await writeFile(htmlPath, html)
await rm(ssrDir, { recursive: true, force: true })
console.log("prerender: dist/index.html updated")
