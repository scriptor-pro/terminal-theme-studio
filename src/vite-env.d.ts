/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from "react"

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
