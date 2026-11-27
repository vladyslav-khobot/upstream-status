/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API, e.g. https://api.example.com. Empty means same-origin /api. */
  readonly VITE_API_URL?: string;
  /** Sent as x-admin-token when the user presses "Refresh". */
  readonly VITE_ADMIN_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
