import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import JSZip from "jszip"
import { allInstallationGuide, colorNames, defaultTheme, exports, installationGuide, slugify, type Theme } from "./theme"
import "./styles.css"

const storageKey = "terminal-theme-studio-theme"
const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
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
      <div className="brand"><img src="/assets/terminal-theme-studio-icon-192.png" alt="" /><div><p className="eyebrow">TERMINAL THEME STUDIO</p><h1>Conçois une palette qui voyage.</h1><p className="intro">Un thème, vingt-trois exports. Tout reste sur ton appareil.</p></div></div>
      <button className="quiet" onClick={() => setTheme(defaultTheme)}>Réinitialiser</button>
    </header>
    <section className="workspace" aria-label="Éditeur de thème">
      <aside className="editor">
        <label className="name-field">Nom du thème<input value={theme.name} onChange={e => setCore("name", e.target.value)} /></label>
        <h2>Fondations</h2>
        <div className="controls">
          {([ ["background", "Arrière-plan"], ["foreground", "Texte"], ["cursor", "Curseur"], ["selectionBackground", "Sélection"], ["selectionForeground", "Texte sélectionné"] ] as const).map(([key, label]) => <ColorControl key={key} label={label} value={theme[key]} onChange={v => setCore(key, v)} />)}
        </div>
        <h2>Rôles et palette ANSI</h2>
        <p className="helper">Les rôles décrivent l’aperçu ; le texte entre parenthèses indique la convention ANSI exportée.</p>
        <div className="ansi-grid">{theme.ansi.map((color, index) => <ColorControl key={index} label={colorNames[index]} value={color} onChange={v => setAnsi(index, v)} />)}</div>
      </aside>
      <section className="preview-area">
        <div className="terminal" style={{ background: theme.background, color: theme.foreground }}>
          <div className="bar"><span /><span /><span /><b>~/projects/theme</b></div>
          <div className="screen">
            <p><span style={{ color: theme.foreground }}>baudouin@studio </span><span style={{ color: theme.ansi[4] }}>~/themes</span> <span style={{ color: theme.ansi[5] }}>git:(main)</span> $ npm run build</p>
            <p style={{ color: theme.ansi[2] }}>✓ built in 284ms</p>
            <p><span style={{ color: theme.ansi[3] }}>warn</span> Export <span style={{ color: theme.ansi[6] }}>wezterm.toml</span> generated</p>
            <p style={{ background: theme.selectionBackground, color: theme.selectionForeground, display: "inline" }}>selected text: visible and readable</p>
            <p style={{ color: theme.ansi[1] }}>error: this is a useful error message</p>
            <div className="swatches">{theme.ansi.map((color, i) => <span key={i} title={colorNames[i]} style={{ background: color }} />)}</div>
            <p><span style={{ color: theme.cursor, borderRight: `2px solid ${theme.cursor}` }}>_</span></p>
          </div>
        </div>
        <div className="export-panel">
          <div><p className="eyebrow">EXPORTER</p><p>Le fichier est généré localement.</p></div>
          <div className="export-actions"><label>Format<select value={target} onChange={e => setTarget(e.target.value)}><option value="" disabled>Choisir un format</option>{sortedExports.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button disabled={!valid || !selected} onClick={() => selected && downloadSelected(selected)}>Télécharger</button><button className="quiet" disabled={!valid} onClick={downloadAll}>Télécharger tous les formats</button></div>
          {!valid && <p className="error">Utilise des codes hexadécimaux au format #RRGGBB.</p>}
        </div>
      </section>
    </section>
  </main>
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="color-control"><span>{label}</span><input aria-label={`${label}, valeur hexadécimale`} className="hex" value={value} onChange={e => onChange(e.target.value)} onBlur={e => { const short = e.target.value.match(/^#([0-9a-fA-F]{3})$/); if (short) onChange(`#${short[1].split("").map(char => char + char).join("")}`) }} /><input aria-label={`${label}, sélecteur de couleur`} type="color" value={isHex(value) ? value : "#000000"} onChange={e => onChange(e.target.value)} /></label> }

createRoot(document.getElementById("root")!).render(<App />)
