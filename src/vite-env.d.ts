/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from "react"

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "footix-footer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        linkedin?: string
        bluesky?: string
        github?: string
        text?: string
        theme?: string
      }
    }
  }
}
