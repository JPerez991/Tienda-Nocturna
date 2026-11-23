/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** URL pública de la tienda (para "Ver la tienda"). */
  readonly VITE_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
