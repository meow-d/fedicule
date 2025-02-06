interface ImportMetaEnv {
  readonly VITE_DEV_SERVER_PORT?: string;
  readonly VITE_CLIENT_URI: string;
  readonly VITE_OAUTH_CLIENT_ID: string;
  readonly VITE_CLIENT_NAME: string;
  readonly VITE_OAUTH_REDIRECT_URI: string;
  readonly VITE_OAUTH_SCOPE: string;
  readonly VITE_OAUTH_MASTO_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
