// footix-footer — a self-contained, style-isolated footer web component.
//
// Usage:
//   <script type="module" src="footix-footer.js"></script>
//   <footix-footer></footix-footer>
//
// Everything is rendered inside a Shadow DOM, so the host page's CSS cannot
// leak in and the footer's CSS cannot leak out: the look/feel is fully
// independent of the rest of the page.
//
// Overridable attributes (all optional, sensible defaults below):
//   linkedin  — full URL to the LinkedIn profile
//   bluesky   — full URL to the Bluesky profile
//   github    — full URL to the GitHub profile
//   text      — the footer credit line
//   theme     — "auto" (default) | "light" | "dark"
//
// Accessibility (WCAG 2.1 AA / RGAA 4):
//   - <footer role="contentinfo"> landmark with an accessible name.
//   - Each icon link has a real accessible name; icons are aria-hidden.
//   - Links to external sites announce "(opens in a new tab)".
//   - Focus-visible outlines; contrast ≥ 4.5:1 in both themes.
//   - Touch targets ≥ 44×44 px (WCAG 2.5.5 / RGAA 13).
//   - Honors prefers-reduced-motion and prefers-color-scheme.

const DEFAULTS = Object.freeze({
  linkedin: "https://www.linkedin.com/in/baudouinvanhumbeeck/",
  bluesky: "https://bsky.app/profile/bvh.fyi",
  github: "https://github.com/scriptor-pro",
  text: "Made in Brussels - Baudouin Van Humbeeck",
  theme: "auto",
});

// Brand glyphs from Simple Icons (CC0). Single-path 0 0 24 24 viewBox.
const ICONS = Object.freeze({
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 " +
    "0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 " +
    "1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 " +
    "7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 " +
    "13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 " +
    "1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 " +
    "22.271V1.729C24 .774 23.2 0 22.225 0z",
  bluesky:
    "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 " +
    "1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 " +
    "3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 " +
    "2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 " +
    "7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 " +
    "01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 " +
    "6.383-3.364.246-.828.624-5.789.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 " +
    "1.24C16.046 4.748 13.087 8.687 12 10.8z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 " +
    "0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 " +
    "17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 " +
    "1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 " +
    "0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 " +
    "3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 " +
    "3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 " +
    "3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 " +
    "2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
});

// Accessible names. Kept in English to match the "opens in a new tab" hint;
// the surrounding page can be any language — these are on the links only.
const LABELS = Object.freeze({
  linkedin: "LinkedIn profile",
  bluesky: "Bluesky profile",
  github: "GitHub profile",
});

const NEW_TAB = "(opens in a new tab)";
const ORDER = ["linkedin", "bluesky", "github"];

const styles = `
  :host {
    /* Overridable design tokens — set these from the page if desired. */
    --footix-bg: #2b211a;
    --footix-fg: #fffff0;
    --footix-muted: #d8cfc2;
    --footix-accent: #f0c05a;
    --footix-focus: #ffd54a;
    --footix-pad-block: 0.4rem;
    --footix-pad-inline: 1rem;
    --footix-gap: 0.75rem;
    --footix-font: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

    display: block;
    box-sizing: border-box;
    contain: content;
    color-scheme: light dark;
  }
  :host([hidden]) { display: none; }

  /* Dark is the default. theme="auto" follows the OS; theme="light" forces light. */
  @media (prefers-color-scheme: light) {
    :host([theme="auto"]) {
      --footix-bg: #f4f6fb;
      --footix-fg: #142033;
      --footix-muted: #3d4b63;
      --footix-accent: #0a5bd6;
      --footix-focus: #b35c00;
    }
  }
  :host([theme="light"]) {
    --footix-bg: #f4f6fb;
    --footix-fg: #142033;
    --footix-muted: #3d4b63;
    --footix-accent: #0a5bd6;
    --footix-focus: #b35c00;
  }
  :host([theme="dark"]) {
    --footix-bg: #2b211a;
    --footix-fg: #fffff0;
    --footix-muted: #d8cfc2;
    --footix-accent: #f0c05a;
    --footix-focus: #ffd54a;
  }

  *, *::before, *::after { box-sizing: inherit; }

  .footer {
    background: var(--footix-bg);
    color: var(--footix-fg);
    font-family: var(--footix-font);
    font-size: 1rem;
    line-height: 1.5;
    padding: var(--footix-pad-block) var(--footix-pad-inline);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--footix-gap);
    text-align: center;
  }

  .social {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .social a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* WCAG 2.5.5 / RGAA target size ≥ 44×44 CSS px. */
    inline-size: 44px;
    block-size: 44px;
    border-radius: 8px;
    color: var(--footix-muted);
    text-decoration: none;
    transition: color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
  }
  .social a:hover { color: var(--footix-accent); }
  .social a:hover svg { transform: translateY(-2px); }
  .social a:active svg { transform: translateY(0); }

  .social a:focus-visible {
    outline: 3px solid var(--footix-focus);
    outline-offset: 2px;
    color: var(--footix-fg);
  }

  .social svg {
    inline-size: 24px;
    block-size: 24px;
    fill: currentColor;
    transition: transform 0.15s ease;
  }

  .credit { color: var(--footix-fg); margin: 0; }

  /* Visually hide but keep for assistive tech. */
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  @media (min-width: 40rem) {
    .footer { flex-direction: row; justify-content: center; }
  }

  @media (prefers-reduced-motion: reduce) {
    .social a, .social svg { transition: none; }
    .social a:hover svg { transform: none; }
  }

  @media (forced-colors: active) {
    .social a { color: LinkText; }
    .social a:focus-visible { outline-color: Highlight; }
    .social svg { fill: currentColor; }
  }
`;

class FootixFooter extends HTMLElement {
  static get observedAttributes() {
    return ["linkedin", "bluesky", "github", "text", "theme"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.childElementCount) this._render();
  }

  _value(name) {
    const v = this.getAttribute(name);
    return v && v.trim() ? v.trim() : DEFAULTS[name];
  }

  _linkHtml(key, href) {
    return `
      <li>
        <a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer me">
          <span class="sr-only">${escapeHtml(LABELS[key])} ${NEW_TAB}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="${ICONS[key]}"></path>
          </svg>
        </a>
      </li>`;
  }

  _render() {
    const links = ORDER.map((k) => this._linkHtml(k, this._value(k))).join("");
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <footer class="footer" role="contentinfo" aria-label="Site footer">
        <ul class="social">${links}</ul>
        <p class="credit">${escapeHtml(this._value("text"))}</p>
      </footer>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function escapeAttr(s) {
  return escapeHtml(s);
}

if (!customElements.get("footix-footer")) {
  customElements.define("footix-footer", FootixFooter);
}

// Expose for programmatic use. No ESM `export` so the file also loads as a
// classic <script> — including via file:// (double-click), where module
// scripts are blocked by the browser.
if (typeof window !== "undefined") window.FootixFooter = FootixFooter;
