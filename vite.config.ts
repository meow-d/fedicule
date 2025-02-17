import { defineConfig, Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import metadata from './public/oauth/client-metadata.json' with { type: 'json' };
import metadataMasto from './public/oauth/client-metadata-masto.json' with { type: 'json' };

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 3000;
const HMR_ENABLED = false;

const oauthPlugin: Plugin = {
  name: "inject-oauth-env",
  config(_conf, { command }) {
    process.env.VITE_CLIENT_NAME = metadata.client_name;
    process.env.VITE_CLIENT_URI = metadata.client_uri;
    process.env.VITE_OAUTH_SCOPE = metadata.scope;

    if (command === 'build') {
      process.env.VITE_OAUTH_CLIENT_ID = metadata.client_id;
      process.env.VITE_OAUTH_REDIRECT_URI = metadata.redirect_uris[0];
      process.env.VITE_OAUTH_MASTO_REDIRECT_URI = metadataMasto.redirect_uris[0];
    } else {
      // bsky
      const redirectUri = (() => {
        const url = new URL(metadata.redirect_uris[0]);
        return `http://${SERVER_HOST}:${SERVER_PORT}${url.pathname}`;
      })();

      const clientId =
        `http://localhost` +
        `?redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(metadata.scope)}`;

      process.env.VITE_DEV_SERVER_PORT = '' + SERVER_PORT;
      process.env.VITE_OAUTH_CLIENT_ID = clientId;
      process.env.VITE_OAUTH_REDIRECT_URI = redirectUri;

      // masto
      const redirectUriMasto = (() => {
        const url = new URL(metadataMasto.redirect_uris[0]);
        return `http://${SERVER_HOST}:${SERVER_PORT}${url.pathname}`;
      })();
      process.env.VITE_OAUTH_MASTO_REDIRECT_URI = redirectUriMasto;
    }
  },
};


export default defineConfig({
  plugins: [solidPlugin(), oauthPlugin],
  server: {
    host: SERVER_HOST,
    port: SERVER_PORT,
    hmr: HMR_ENABLED,
  },
  build: {
    target: "esnext",
  },
});
