/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other environment variables used in your project here
  // For example:
  // readonly VITE_APP_TITLE: string;
  // readonly VITE_SOME_KEY: string;
  [key: string]: string | undefined;
}
