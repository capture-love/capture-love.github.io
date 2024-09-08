/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HEADER: string
  readonly VITE_SITE_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
