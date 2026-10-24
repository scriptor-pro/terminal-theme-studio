// Visible FAQ, also injected as FAQPage JSON-LD at build time (scripts/prerender.mjs),
// so the structured data always matches what users see on the page.
export const faq: { question: string; answer: string }[] = [
  {
    question: "Which terminals and shells does Terminal Theme Studio support?",
    answer: "One palette exports to 28 formats: Alacritty, Contour, foot, Ghostty, GNOME Terminal, Hyper, iTerm2, Kitty, Konsole, MobaXterm, Ptyxis, PuTTY, Rio, sakura, SecureCRT, Tabby, Terminal.app, Terminator, Tilix, urxvt, Warp, WezTerm, Windows Terminal, Xfce Terminal and xterm, plus Bash, Zsh, Fish and Nushell.",
  },
  {
    question: "Is Terminal Theme Studio free?",
    answer: "Yes. It is free, needs no account and no installation: it runs in your browser.",
  },
  {
    question: "Does my theme leave my device?",
    answer: "No. Editing, preview and export all happen locally in your browser, and your palette is only saved in your browser's local storage. No theme data is sent to a server.",
  },
  {
    question: "How do I install the exported theme?",
    answer: "Every download comes with a Markdown installation guide for the chosen terminal, with copy-paste commands. The \"Download all formats\" ZIP archive includes a guide covering every format.",
  },
  {
    question: "How does the contrast check work?",
    answer: "The editor compares text and each ANSI color against the background, and selected text against the selection color, using the WCAG 2.1 formula. Pairs below the AA ratio of 4.5:1 are listed, so you can build an accessible, readable terminal theme.",
  },
  {
    question: "Can I edit a theme later?",
    answer: "Yes. Your current palette and theme name are kept in your browser, so you can come back, tweak a color and export again. Reset restores the default palette.",
  },
]
