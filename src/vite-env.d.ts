/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GREPTILE_API_KEY?: string;
  readonly VITE_NIA_API_KEY?: string;
  readonly VITE_CLOD_API_KEY?: string;
  /** Local FastAPI proxy — e.g. http://127.0.0.1:8000 (see backend/main.py) */
  readonly VITE_CLOD_BACKEND_URL?: string;
  readonly VITE_CLOD_BASE_URL?: string;
  readonly VITE_CLOD_MODEL?: string;
  readonly VITE_ALLSCALE_API_KEY?: string;
  readonly VITE_BGA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
