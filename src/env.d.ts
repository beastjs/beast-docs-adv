/// <reference types="vite/client" />

/** Installed `beast-tsrx` version, injected by rspack.config.ts. */
declare const __BEAST_VERSION__: string

declare module '*.btsx' {
  import type { ComponentBody } from 'octane'

  const component: ComponentBody
  export default component
}
