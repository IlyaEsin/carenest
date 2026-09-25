/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Empty in development (the Vite proxy serves /api); the API origin in production.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
