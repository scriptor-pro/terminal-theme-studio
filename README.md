# Terminal Theme Studio

Terminal palette editor and local theme generator. It supports 27 exports, including Kitty, WezTerm, Alacritty, Windows Terminal, iTerm2, Ghostty, Konsole, Contour, Bash/Zsh, Fish, and Nushell.

## Start locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is generated in `dist/`. The app requires no backend and can be deployed directly to Cloudflare Pages.

The default production URL is `https://terminal-theme-studio.pages.dev/`. If a custom domain is added later, update the canonical URL, social metadata, `public/robots.txt`, and `public/sitemap.xml` accordingly.
