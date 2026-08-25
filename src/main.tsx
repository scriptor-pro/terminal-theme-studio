import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import JSZip from "jszip"
import { allInstallationGuide, colorNames, defaultTheme, exports, installationGuide, slugify, type Theme } from "./theme"
import "./styles.css"

const storageKey = "terminal-theme-studio-theme"
const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
const luminance = (hex: string) => hex.slice(1).match(/.{2}/g)!.map(value => {
  const channel = Number.parseInt(value, 16) / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}).reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)
const contrast = (first: string, second: string) => {
  if (!isHex(first) || !isHex(second)) return 0
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}
const readablePreviewColor = (color: string, background: string) => contrast(color, background) >= 4.5 ? color : contrast("#ffffff", background) >= contrast("#000000", background) ? "#ffffff" : "#000000"
const download = (filename: string, body: BlobPart, type = "text/plain;charset=utf-8") => { const url = URL.createObjectURL(new Blob([body], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) }

function App() {
  const [theme, setTheme] = useState<Theme>(() => { try { return { ...defaultTheme, ...JSON.parse(localStorage.getItem(storageKey) || "{}") } } catch { return defaultTheme } })
  const [target, setTarget] = useState("")
  const selected = useMemo(() => exports.find(x => x.id === target), [target])
  const sortedExports = useMemo(() => [...exports].sort((a, b) => a.label.localeCompare(b.label, "fr")), [])
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(theme)), [theme])
  const setCore = (key: keyof Omit<Theme, "ansi">, value: string) => setTheme(current => ({ ...current, [key]: value }))
  const setAnsi = (index: number, value: string) => setTheme(current => ({ ...current, ansi: current.ansi.map((color, i) => i === index ? value : color) }))
  const valid = [theme.background, theme.foreground, theme.cursor, theme.selectionBackground, theme.selectionForeground, ...theme.ansi].every(isHex)
  const contrastFailures = valid ? [
    ["Text", theme.foreground, theme.background],
    ...theme.ansi.map((color, i): [string, string, string] => [colorNames[i], color, theme.background]),
    ["Selected text", theme.selectionForeground, theme.selectionBackground],
  ].filter(([, fg, bg]) => contrast(fg, bg) < 4.5) : []
  const previewForeground = readablePreviewColor(theme.foreground, theme.background)
  const downloadAll = async () => {
    const zip = new JSZip()
    const name = slugify(theme.name)
    zip.file("README.md", allInstallationGuide(theme))
    exports.forEach(item => zip.file(`themes/${item.id}/${item.filename(name)}`, item.generate(theme)))
    download(`${name}-formats.zip`, await zip.generateAsync({ type: "blob" }), "application/zip")
  }
  const downloadSelected = (item: typeof exports[number]) => {
    const name = slugify(theme.name)
    download(item.filename(name), item.generate(theme))
    download(`${name}-${item.id}-installation.md`, installationGuide(item, theme))
  }
  return <main>
    <header>
      <div className="brand"><img src="/assets/terminal-theme-studio-icon-192.png" alt="" /><div><p className="eyebrow">TERMINAL THEME STUDIO</p><h1>Build your own terminal theme.</h1><p className="intro">One theme, twenty-three exports. Everything stays on your device.</p></div></div>
      <button className="quiet" onClick={() => setTheme(defaultTheme)}>Reset</button>
    </header>
    <section className="workspace" aria-label="Theme editor">
      <aside className="editor">
        <label className="name-field">Theme name<input value={theme.name} onChange={e => setCore("name", e.target.value)} /></label>
        <h2>Foundations</h2>
        <div className="controls">
          {([ ["background", "Background"], ["foreground", "Text"], ["cursor", "Cursor"], ["selectionBackground", "Selection"], ["selectionForeground", "Selected text"] ] as const).map(([key, label]) => <ColorControl key={key} label={label} value={theme[key]} onChange={v => setCore(key, v)} />)}
        </div>
        <h2>Roles and ANSI palette</h2>
        <p className="helper">Roles describe the preview; the text in parentheses identifies the exported ANSI convention.</p>
        <div className="ansi-grid">{theme.ansi.map((color, index) => <ColorControl key={index} label={colorNames[index]} value={color} onChange={v => setAnsi(index, v)} />)}</div>
      </aside>
      <section className="preview-area">
        <div className="terminal" style={{ background: theme.background, color: previewForeground }}>
          <div className="bar"><span /><span /><span /><b>~/projects/theme</b></div>
          <div className="screen">
            <p><span style={{ color: previewForeground }}>baudouin@studio </span><span style={{ color: readablePreviewColor(theme.ansi[4], theme.background) }}>~/themes</span> <span style={{ color: readablePreviewColor(theme.ansi[5], theme.background) }}>git:(main)</span> $ npm run build</p>
            <p style={{ color: readablePreviewColor(theme.ansi[2], theme.background) }}>✓ built in 284ms</p>
            <p><span style={{ color: readablePreviewColor(theme.ansi[3], theme.background) }}>warn</span> Export <span style={{ color: readablePreviewColor(theme.ansi[6], theme.background) }}>wezterm.toml</span> generated</p>
            <p style={{ background: theme.selectionBackground, color: readablePreviewColor(theme.selectionForeground, theme.selectionBackground), display: "inline" }}>selected text: visible and readable</p>
            <p style={{ color: readablePreviewColor(theme.ansi[1], theme.background) }}>error: this is a useful error message</p>
            <div className="swatches" aria-label="ANSI color swatches">{theme.ansi.map((color, i) => <span key={i} title={`${colorNames[i]}: ${color}`} style={{ background: color }} />)}</div>
            <p><span style={{ color: readablePreviewColor(theme.cursor, theme.background), borderRight: `2px solid ${readablePreviewColor(theme.cursor, theme.background)}` }}>_</span></p>
          </div>
        </div>
        <div className="export-panel">
          <div><p className="eyebrow">EXPORT</p><p>The file is generated locally.</p></div>
          <div className="export-actions"><label>Format<select value={target} onChange={e => setTarget(e.target.value)}><option value="" disabled>Choose a format</option>{sortedExports.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button disabled={!valid || !selected} onClick={() => selected && downloadSelected(selected)}>Download</button><button className="quiet" disabled={!valid} onClick={downloadAll}>Download all formats</button></div>
          {!valid && <p id="hex-format-help" className="error" role="alert">Use hexadecimal color codes in the #RRGGBB format.</p>}
          {valid && contrastFailures.length > 0 && <p className="contrast-warning" role="status">{contrastFailures.length} color {contrastFailures.length === 1 ? "pair does" : "pairs do"} not meet the 4.5:1 AA contrast ratio: {contrastFailures.map(([label, fg, bg]) => `${label} (${fg} on ${bg})`).join(", ")}. The preview uses black or white text where needed; exported files preserve your chosen colors.</p>}
        </div>
      </section>
    </section>
    <footer className="privacy-note">Anonymous, cookie-free analytics via self-hosted <a href="https://umami.is" target="_blank" rel="noreferrer">Umami</a>. No personal data is collected or shared with third parties.</footer>
  </main>
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const valid = isHex(value); return <label className="color-control"><span>{label}</span><input aria-label={`${label}, hexadecimal value`} aria-describedby={valid ? undefined : "hex-format-help"} aria-invalid={!valid} aria-required="true" className="hex" inputMode="text" pattern="#[0-9a-fA-F]{6}" value={value} onChange={e => onChange(e.target.value)} onBlur={e => { const short = e.target.value.match(/^#([0-9a-fA-F]{3})$/); if (short) onChange(`#${short[1].split("").map(char => char + char).join("")}`) }} /><input aria-label={`${label}, color picker`} type="color" value={isHex(value) ? value : "#000000"} onChange={e => onChange(e.target.value)} /></label> }

createRoot(document.getElementById("root")!).render(<App />)
