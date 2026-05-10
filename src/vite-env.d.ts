/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GREPTILE_API_KEY?: string;
  readonly VITE_NIA_API_KEY?: string;
  readonly VITE_CLOD_API_KEY?: string;
  readonly VITE_ALLSCALE_API_KEY?: string;
  readonly VITE_BGA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
