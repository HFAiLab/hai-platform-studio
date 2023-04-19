interface ImportMetaEnv {
  readonly VITE_SHORT_VERSION: string
  readonly VITE_PREPUB: string
  readonly VITE_BUILD_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
