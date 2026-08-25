import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

const inlineCss = (): Plugin => ({
  name: "inline-css",
  enforce: "post",
  apply: "build",
  transformIndexHtml(html, { bundle }) {
    if (!bundle) return html
    const cssAssets = Object.values(bundle).filter(
      (chunk): chunk is typeof chunk & { type: "asset"; fileName: string; source: string | Uint8Array } =>
        chunk.type === "asset" && chunk.fileName.endsWith(".css")
    )
    let result = html
    for (const asset of cssAssets) {
      const href = new RegExp(`<link[^>]*href="/${asset.fileName}"[^>]*>`)
      const css = typeof asset.source === "string" ? asset.source : Buffer.from(asset.source).toString("utf-8")
      result = result.replace(href, `<style>${css}</style>`)
      delete bundle[asset.fileName]
    }
    return result
  },
})

export default defineConfig({
  plugins: [react(), inlineCss()],
})
