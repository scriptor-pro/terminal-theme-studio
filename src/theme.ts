export type Theme = {
  name: string
  background: string
  foreground: string
  cursor: string
  selectionBackground: string
  selectionForeground: string
  ansi: string[]
}

export const defaultTheme: Theme = {
  name: "My theme",
  background: "#1e1e2e",
  foreground: "#cdd6f4",
  cursor: "#f5e0dc",
  selectionBackground: "#585b70",
  selectionForeground: "#cdd6f4",
  ansi: [
    "#45475a", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#f5c2e7", "#94e2d5", "#bac2de",
    "#585b70", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#f5c2e7", "#94e2d5", "#a6adc8"
  ]
}

export const colorNames = [
  "Black (ANSI 0)", "Error (red)", "Success (green)", "Warning (yellow)",
  "Directory / path (blue)", "Git branch (magenta)", "Link / information (cyan)", "Primary text (white)",
  "Bright black (ANSI 8)", "Bright error (bright red)", "Bright success (bright green)", "Bright warning (bright yellow)",
  "Bright directory (bright blue)", "Bright Git branch (bright magenta)", "Bright link (bright cyan)", "Bright text (bright white)"
]

export const slugify = (value: string) => value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "terminal-theme"

const quoted = (value: string) => JSON.stringify(value)
const paletteLines = (theme: Theme, style: "equals" | "space" = "equals") => theme.ansi.map((color, i) => style === "equals" ? `color${i} = ${color}` : `color${i} ${color}`).join("\n")
const rgb = (hex: string) => [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16))
const konsoleColor = (hex: string) => rgb(hex).join(",")
const iTermColor = (name: string, hex: string) => {
  const [red, green, blue] = rgb(hex).map(value => (value / 255).toFixed(6))
  return `  <key>${name}</key><dict><key>Color Space</key><string>sRGB</string><key>Red Component</key><real>${red}</real><key>Green Component</key><real>${green}</real><key>Blue Component</key><real>${blue}</real></dict>`
}
const ansiNames = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]
const namedPalette = (theme: Theme, offset = 0) => ansiNames.map((name, index) => `${name}: ${theme.ansi[index + offset]}`).join("\n")
const shellPalette = (theme: Theme) => theme.ansi.map(color => `'${color}'`).join(", ")
const rgbCsv = (hex: string) => rgb(hex).join(",")

export type ExportTarget = { id: string; label: string; filename: (slug: string) => string; generate: (theme: Theme) => string }

export const exports: ExportTarget[] = [
  { id: "kitty", label: "Kitty (.conf)", filename: s => `${s}.conf`, generate: t => `# ${t.name}\nforeground ${t.foreground}\nbackground ${t.background}\ncursor ${t.cursor}\nselection_foreground ${t.selectionForeground}\nselection_background ${t.selectionBackground}\n${paletteLines(t, "space")}` },
  { id: "wezterm", label: "WezTerm (.toml)", filename: s => `${s}.toml`, generate: t => `[metadata]\nname = ${quoted(t.name)}\n\n[colors]\nforeground = ${quoted(t.foreground)}\nbackground = ${quoted(t.background)}\ncursor_bg = ${quoted(t.cursor)}\nselection_fg = ${quoted(t.selectionForeground)}\nselection_bg = ${quoted(t.selectionBackground)}\nansi = [${t.ansi.slice(0, 8).map(quoted).join(", ")}]\nbrights = [${t.ansi.slice(8).map(quoted).join(", ")}]\n` },
  { id: "alacritty", label: "Alacritty (.toml)", filename: s => `${s}.toml`, generate: t => `[colors.primary]\nbackground = ${quoted(t.background)}\nforeground = ${quoted(t.foreground)}\n\n[colors.cursor]\ncursor = ${quoted(t.cursor)}\ntext = ${quoted(t.background)}\n\n[colors.selection]\ntext = ${quoted(t.selectionForeground)}\nbackground = ${quoted(t.selectionBackground)}\n\n[colors.normal]\n${["black","red","green","yellow","blue","magenta","cyan","white"].map((n,i) => `${n} = ${quoted(t.ansi[i])}`).join("\n")}\n\n[colors.bright]\n${["black","red","green","yellow","blue","magenta","cyan","white"].map((n,i) => `${n} = ${quoted(t.ansi[i+8])}`).join("\n")}\n` },
  { id: "windows-terminal", label: "Windows Terminal (.json)", filename: s => `${s}.json`, generate: t => JSON.stringify({ schemes: [{ name: t.name, background: t.background, foreground: t.foreground, cursorColor: t.cursor, selectionBackground: t.selectionBackground, black: t.ansi[0], red: t.ansi[1], green: t.ansi[2], yellow: t.ansi[3], blue: t.ansi[4], purple: t.ansi[5], cyan: t.ansi[6], white: t.ansi[7], brightBlack: t.ansi[8], brightRed: t.ansi[9], brightGreen: t.ansi[10], brightYellow: t.ansi[11], brightBlue: t.ansi[12], brightPurple: t.ansi[13], brightCyan: t.ansi[14], brightWhite: t.ansi[15] }] }, null, 2) + "\n" },
  { id: "iterm2", label: "iTerm2 (.itermcolors)", filename: s => `${s}.itermcolors`, generate: t => `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>\n${iTermColor("Background Color", t.background)}\n${iTermColor("Foreground Color", t.foreground)}\n${iTermColor("Cursor Color", t.cursor)}\n${iTermColor("Selection Color", t.selectionBackground)}\n${t.ansi.map((color, index) => iTermColor(`Ansi ${index} Color`, color)).join("\n")}\n</dict></plist>\n` },
  { id: "ghostty", label: "Ghostty (theme)", filename: s => s, generate: t => `# ${t.name}\nbackground = ${t.background}\nforeground = ${t.foreground}\ncursor-color = ${t.cursor}\nselection-background = ${t.selectionBackground}\nselection-foreground = ${t.selectionForeground}\n${t.ansi.map((c, i) => `palette = ${i}=${c}`).join("\n")}\n` },
  { id: "konsole", label: "Konsole (.colorscheme)", filename: s => `${s}.colorscheme`, generate: t => `[General]\nDescription=${t.name}\nOpacity=1\n\n[Background]\nColor=${konsoleColor(t.background)}\n\n[Foreground]\nColor=${konsoleColor(t.foreground)}\n\n[Cursor]\nColor=${konsoleColor(t.cursor)}\n\n${t.ansi.slice(0, 8).map((color, index) => `[Color${index}]\nColor=${konsoleColor(color)}`).join("\n\n")}\n\n${t.ansi.slice(8).map((color, index) => `[Color${index}Intense]\nColor=${konsoleColor(color)}`).join("\n\n")}\n` }
  ,{ id: "foot", label: "foot (.ini)", filename: s => `${s}.ini`, generate: t => `[colors]\nbackground=${t.background.slice(1)}\nforeground=${t.foreground.slice(1)}\ncursor=${t.cursor.slice(1)}\nselection-foreground=${t.selectionForeground.slice(1)}\nselection-background=${t.selectionBackground.slice(1)}\n${t.ansi.slice(0, 8).map((color, index) => `regular${index}=${color.slice(1)}`).join("\n")}\n${t.ansi.slice(8).map((color, index) => `bright${index}=${color.slice(1)}`).join("\n")}\n` }
  ,{ id: "rio", label: "Rio (.toml)", filename: s => `${s}.toml`, generate: t => `[colors]\nbackground = ${quoted(t.background)}\nforeground = ${quoted(t.foreground)}\ncursor = ${quoted(t.cursor)}\nselection-background = ${quoted(t.selectionBackground)}\nselection-foreground = ${quoted(t.selectionForeground)}\n${ansiNames.map((name, index) => `${name} = ${quoted(t.ansi[index])}`).join("\n")}\n${ansiNames.map((name, index) => `light-${name} = ${quoted(t.ansi[index + 8])}`).join("\n")}\n` }
  ,{ id: "hyper", label: "Hyper (.hyper.js)", filename: s => `${s}.hyper.js`, generate: t => `// Add this object inside config in .hyper.js\nmodule.exports = {\n  config: {\n    foregroundColor: ${quoted(t.foreground)},\n    backgroundColor: ${quoted(t.background)},\n    cursorColor: ${quoted(t.cursor)},\n    cursorAccentColor: ${quoted(t.background)},\n    selectionColor: ${quoted(t.selectionBackground)},\n    colors: {\n${ansiNames.map((name, index) => `      ${name}: ${quoted(t.ansi[index])},\n      light${name[0].toUpperCase()}${name.slice(1)}: ${quoted(t.ansi[index + 8])}`).join(",\n")}\n    }\n  }\n}\n` }
  ,{ id: "tabby", label: "Tabby (.yaml)", filename: s => `${s}.yaml`, generate: t => `# Add under terminal.customColorSchemes in Tabby's config.yaml\n- name: ${quoted(t.name)}\n  foreground: ${quoted(t.foreground)}\n  background: ${quoted(t.background)}\n  cursor: ${quoted(t.cursor)}\n  cursorAccent: ${quoted(t.background)}\n  selection: ${quoted(t.selectionBackground)}\n  selectionForeground: ${quoted(t.selectionForeground)}\n  colors:\n${t.ansi.map(color => `    - ${quoted(color)}`).join("\n")}\n` }
  ,{ id: "warp", label: "Warp (.yaml)", filename: s => `${s}.yaml`, generate: t => `name: ${quoted(t.name)}\naccent: ${t.cursor}\ncursor: ${t.cursor}\nbackground: ${t.background}\nforeground: ${t.foreground}\ndetails:\n  darker: ${t.background}\n  lighter: ${t.foreground}\nterminal_colors:\n  normal:\n${namedPalette(t).split("\n").map(line => `    ${line}`).join("\n")}\n  bright:\n${namedPalette(t, 8).split("\n").map(line => `    ${line}`).join("\n")}\n` }
  ,{ id: "terminal-app", label: "Terminal.app (installation guide .md)", filename: s => `${s}-terminal-app.md`, generate: t => `# ${t.name} — Terminal.app\n\nTerminal.app imports .terminal profiles, but Apple stores each color in a specific binary format.\n\n1. Open Terminal > Settings > Profiles and create a profile.\n2. In the Text tab, set text to ${t.foreground}, background to ${t.background}, and cursor to ${t.cursor}.\n3. In the Colors tab, enter the ANSI palette:\n\n${t.ansi.map((color, index) => `- ANSI ${index}: ${color}`).join("\n")}\n\nSelection: background ${t.selectionBackground}, text ${t.selectionForeground}.\nThen export the profile from Terminal to generate its native .terminal file.\n` }
  ,{ id: "tilix", label: "Tilix (script .sh)", filename: s => `${s}-tilix.sh`, generate: t => `#!/usr/bin/env bash\n# Applies the palette to Tilix's current default profile.\nset -eu\nprofile=$(gsettings get com.gexperts.Tilix.ProfilesList default | tr -d \"'\")\npath=\"/com/gexperts/Tilix/profiles/$profile/\"\ngsettings set com.gexperts.Tilix.Profile:\"$path\" use-theme-colors false\ngsettings set com.gexperts.Tilix.Profile:\"$path\" background-color '${t.background}'\ngsettings set com.gexperts.Tilix.Profile:\"$path\" foreground-color '${t.foreground}'\ngsettings set com.gexperts.Tilix.Profile:\"$path\" palette \"[${shellPalette(t)}]\"\n` }
  ,{ id: "terminator", label: "Terminator (.config)", filename: s => `${s}-terminator.config`, generate: t => `# Merge this profile into ~/.config/terminator/config\n[profiles]\n  [[${slugify(t.name)}]]\n    use_theme_colors = False\n    foreground_color = ${t.foreground}\n    background_color = ${t.background}\n    cursor_color = ${t.cursor}\n    palette = ${t.ansi.join(":")}\n` }
  ,{ id: "gnome-terminal", label: "GNOME Terminal (script .sh)", filename: s => `${s}-gnome-terminal.sh`, generate: t => `#!/usr/bin/env bash\n# Applies the palette to GNOME Terminal's current default profile.\nset -eu\nprofile=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d \"'\")\npath=\"/org/gnome/terminal/legacy/profiles:/:$profile/\"\nschema=org.gnome.Terminal.Legacy.Profile:\"$path\"\ngsettings set \"$schema\" use-theme-colors false\ngsettings set \"$schema\" foreground-color '${t.foreground}'\ngsettings set \"$schema\" background-color '${t.background}'\ngsettings set \"$schema\" palette \"[${shellPalette(t)}]\"\n` }
  ,{ id: "ptyxis", label: "Ptyxis (.palette)", filename: s => `${s}.palette`, generate: t => `[Palette]\nName=${t.name}\nForeground=${t.foreground}\nBackground=${t.background}\nCursor=${t.cursor}\nSelectionBackground=${t.selectionBackground}\nSelectionForeground=${t.selectionForeground}\n${t.ansi.map((color, index) => `Color${index}=${color}`).join("\n")}\n` }
  ,{ id: "xfce-terminal", label: "Xfce Terminal (.theme)", filename: s => `${s}.theme`, generate: t => `[Scheme]\nName=${t.name}\nColorForeground=${t.foreground}\nColorBackground=${t.background}\nColorCursor=${t.cursor}\nColorSelection=${t.selectionBackground}\nColorPalette=${t.ansi.join(";")}\n` }
  ,{ id: "xterm", label: "xterm (.Xresources)", filename: s => `${s}-xterm.Xresources`, generate: t => `! ${t.name}\nxterm*background: ${t.background}\nxterm*foreground: ${t.foreground}\nxterm*cursorColor: ${t.cursor}\n${t.ansi.map((color, index) => `xterm*color${index}: ${color}`).join("\n")}\n` }
  ,{ id: "urxvt", label: "urxvt / rxvt-unicode (.Xresources)", filename: s => `${s}-urxvt.Xresources`, generate: t => `! ${t.name}\nURxvt*background: ${t.background}\nURxvt*foreground: ${t.foreground}\nURxvt*cursorColor: ${t.cursor}\n${t.ansi.map((color, index) => `URxvt*color${index}: ${color}`).join("\n")}\n` }
  ,{ id: "putty", label: "PuTTY (.reg)", filename: s => `${s}-putty.reg`, generate: t => `Windows Registry Editor Version 5.00\n\n; Import this after creating a PuTTY saved session named ${t.name}.\n[HKEY_CURRENT_USER\\Software\\SimonTatham\\PuTTY\\Sessions\\${encodeURIComponent(t.name)}]\n\"Colour0\"=\"${rgbCsv(t.foreground)}\"\n\"Colour1\"=\"${rgbCsv(t.foreground)}\"\n\"Colour2\"=\"${rgbCsv(t.background)}\"\n\"Colour3\"=\"${rgbCsv(t.background)}\"\n\"Colour5\"=\"${rgbCsv(t.cursor)}\"\n${t.ansi.flatMap((color, index) => [`\"Colour${index * 2 + 6}\"=\"${rgbCsv(color)}\"`, `\"Colour${index * 2 + 7}\"=\"${rgbCsv(color)}\"`]).join("\n")}\n` }
  ,{ id: "mobaxterm", label: "MobaXterm (.ini)", filename: s => `${s}-MobaXterm.ini`, generate: t => `[Colors]\nDefaultColorScheme=4\nBlack=${rgbCsv(t.ansi[0])}\nBoldBlack=${rgbCsv(t.ansi[8])}\nRed=${rgbCsv(t.ansi[1])}\nBoldRed=${rgbCsv(t.ansi[9])}\nGreen=${rgbCsv(t.ansi[2])}\nBoldGreen=${rgbCsv(t.ansi[10])}\nYellow=${rgbCsv(t.ansi[3])}\nBoldYellow=${rgbCsv(t.ansi[11])}\nBlue=${rgbCsv(t.ansi[4])}\nBoldBlue=${rgbCsv(t.ansi[12])}\nMagenta=${rgbCsv(t.ansi[5])}\nBoldMagenta=${rgbCsv(t.ansi[13])}\nCyan=${rgbCsv(t.ansi[6])}\nBoldCyan=${rgbCsv(t.ansi[14])}\nWhite=${rgbCsv(t.ansi[7])}\nBoldWhite=${rgbCsv(t.ansi[15])}\nForegroundColour=${rgbCsv(t.foreground)}\nBackgroundColour=${rgbCsv(t.background)}\nCursorColour=${rgbCsv(t.cursor)}\n` }
  ,{ id: "securecrt", label: "SecureCRT (installation guide .md)", filename: s => `${s}-securecrt.md`, generate: t => `# ${t.name} — SecureCRT\n\nIn Global Options > Terminal > Appearance > Advanced, create a Color Scheme, then an ANSI Color Palette with the same name.\n\n- Text: ${t.foreground}\n- Background: ${t.background}\n- Cursor: ${t.cursor}\n- Selection: ${t.selectionBackground}\n\nANSI palette (decimal RGB):\n${t.ansi.map((color, index) => `- ${index}: ${rgbCsv(color)}`).join("\n")}\n\nApply this scheme in Session Options > Terminal > Appearance.\n` }
]

const installationSteps = (target: ExportTarget, theme: Theme) => {
  const filename = target.filename(slugify(theme.name))
  switch (target.id) {
    case "alacritty": return `Copy \`${filename}\` to a theme folder, such as \`~/.config/alacritty/themes/\`. Add \`import = ["~/.config/alacritty/themes/${filename}"]\` to \`alacritty.toml\`, then restart Alacritty.`
    case "foot": return `Merge \`${filename}\` into the \`[colors]\` section of \`~/.config/foot/foot.ini\` (or your active configuration file), then open a new foot window.`
    case "ghostty": return `Copy \`${filename}\` to \`~/.config/ghostty/themes/\`. In \`~/.config/ghostty/config\`, add \`theme = ${slugify(theme.name)}\`, then restart Ghostty.`
    case "gnome-terminal": return `Make the script executable with \`chmod +x ${filename}\`, then run \`./${filename}\`. It changes GNOME Terminal’s default profile; close and reopen the terminal afterwards.`
    case "hyper": return `Open Hyper’s \`.hyper.js\` file, then replace or merge its \`config\` object with the content of \`${filename}\`. Restart Hyper.`
    case "iterm2": return `In iTerm2, open Preferences > Profiles > Colors > Color Presets… > Import…, choose \`${filename}\`, then apply the preset to the desired profile.`
    case "kitty": return `Copy \`${filename}\` to \`~/.config/kitty/themes/\` (create the folder if needed). Add \`include themes/${filename}\` to \`~/.config/kitty/kitty.conf\`, then restart Kitty.`
    case "konsole": return `Copy \`${filename}\` to \`~/.local/share/konsole/\`. In Konsole, open Settings > Edit Current Profile > Appearance and select the new color scheme.`
    case "mobaxterm": return `Back up \`MobaXterm.ini\` first. Then merge the \`[Colors]\` section from \`${filename}\` into that file and restart MobaXterm.`
    case "ptyxis": return `Copy \`${filename}\` to \`~/.local/share/org.gnome.Ptyxis/palettes/\` (create the folder if necessary). Restart Ptyxis, then choose the palette in the profile preferences.`
    case "putty": return `First create a saved PuTTY session named “${theme.name}”. Double-click \`${filename}\` (or run \`reg import ${filename}\`), then restart PuTTY and open that session.`
    case "rio": return `Copy \`${filename}\` to \`~/.config/rio/themes/\`. Add \`theme = "${slugify(theme.name)}"\` to \`~/.config/rio/config.toml\`, then restart Rio.`
    case "securecrt": return `The downloaded file is already SecureCRT’s dedicated guide: open \`${filename}\` and enter its values in Global Options > Terminal > Appearance.`
    case "tabby": return `Open Tabby’s configuration, then add the content of \`${filename}\` under \`terminal.customColorSchemes\` in \`config.yaml\`. Select the scheme in your terminal profile.`
    case "terminal-app": return `The downloaded file is Terminal.app’s dedicated guide: open \`${filename}\`, create a profile in Terminal > Settings > Profiles, then enter the listed colors.`
    case "terminator": return `Merge the profile block from \`${filename}\` into \`~/.config/terminator/config\`. In Preferences > Profiles, select the “${slugify(theme.name)}” profile, then restart Terminator.`
    case "tilix": return `Make the script executable with \`chmod +x ${filename}\`, then run \`./${filename}\`. It applies the colors to Tilix’s default profile; open a new window afterwards.`
    case "urxvt": return `Add the content of \`${filename}\` to \`~/.Xresources\`, then run \`xrdb -merge ~/.Xresources\` before opening a new urxvt window.`
    case "warp": return `Copy \`${filename}\` to \`~/.warp/themes/\`. Open Warp’s settings, select the theme in Appearance, and restart Warp if needed.`
    case "wezterm": return `Copy \`${filename}\` to \`~/.config/wezterm/colors/\`. In your WezTerm configuration, load the scheme by name or merge its colors, then restart WezTerm.`
    case "windows-terminal": return `Open Settings > Open JSON file in Windows Terminal. Add the object from \`${filename}\` to the \`schemes\` array, save, then select “${theme.name}” in the profile you want to customize.`
    case "xfce-terminal": return `Copy \`${filename}\` to \`~/.local/share/xfce4/terminal/colorschemes/\` (create the folder if needed). Close every Xfce Terminal window, then restart the application: it reads schemes at launch. Select the scheme for your profile in Preferences.`
    case "xterm": return `Add the content of \`${filename}\` to \`~/.Xresources\`, then run \`xrdb -merge ~/.Xresources\` before launching a new xterm window.`
    default: return `Refer to ${target.label} documentation to import or merge \`${filename}\`.`
  }
}

export const installationGuide = (target: ExportTarget, theme: Theme) => `# Install “${theme.name}” in ${target.label}\n\nTheme file: \`${target.filename(slugify(theme.name))}\`.\n\n## Steps\n\n${installationSteps(target, theme)}\n\n> Files are generated locally by Terminal Theme Studio.\n`

export const allInstallationGuide = (theme: Theme) => `# ${theme.name} — Installation guide\n\nThis archive stores each export in \`themes/<emulator>/\`. Follow only the instructions for the emulator you use.\n\n${exports.map(target => `## ${target.label}\n\nFile: \`themes/${target.id}/${target.filename(slugify(theme.name))}\`.\n\n${installationSteps(target, theme)}`).join("\n\n")}\n\n> All files were generated locally by Terminal Theme Studio.\n`
