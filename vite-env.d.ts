/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEREST_PROJECT_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
