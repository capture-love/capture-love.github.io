/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_ACCESS_KEY_ID: string
  readonly VITE_AWS_ACCOUNT_ID: string
  readonly VITE_AWS_S3_BUCKET: string
  readonly VITE_AWS_S3_REGION: string
  readonly VITE_AWS_SECRET_ACCESS_KEY: string
  readonly VITE_HEADER: string
  readonly VITE_SITE_TITLE: string
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv
}
