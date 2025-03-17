/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEREST_PROJECT_NAME: string;
  readonly NEREST_CLIENT_SIDE_EFFECTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
