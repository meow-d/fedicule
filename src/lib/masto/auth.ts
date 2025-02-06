import { post, postParams } from "./mastoapi";
import { auth, setAuth, type Auth } from "../../stores/auth";

export async function createApp(handle: string) {
  // TODO: yeah why tf did you ask them for the full handle
  const instance = handle.split("@")[2];
  if (!instance) {
    throw new Error("Invalid handle");
  }

  setAuth({
    type: "mastoapi",
    loggedIn: false,
    handle,
    instance,
  });

  const clientName = import.meta.env.VITE_CLIENT_NAME;
  const redirectUri = import.meta.env.VITE_OAUTH_MASTO_REDIRECT_URI;
  const response = await post("/api/v1/apps", {
    client_name: clientName,
    redirect_uris: redirectUri,
    scopes: "read",
  });
  const data = await response.json();

  const params = {
    response_type: "code",
    client_id: data.client_id,
    redirect_uri: redirectUri,
    scope: "read",
  };
  const url = `https://${instance}/oauth/authorize?${new URLSearchParams(params).toString()}`;

  setAuth({
    clientId: data.client_id,
    clientSecret: data.client_secret,
  });

  return url;
}

export async function getToken(url: Location) {
  const urlParams = new URLSearchParams(url.search);
  const code = urlParams.get("code");
  const redirectUri = import.meta.env.VITE_OAUTH_MASTO_REDIRECT_URI;

  if (auth.type !== "mastoapi") {
    throw new Error("Not logged in");
  }
  if (!auth.clientId || !auth.clientSecret) {
    throw new Error("Client ID or Client Secret not found");
  }
  if (!code) throw new Error("No code found");

  const response = await postParams("/oauth/token", {
    grant_type: "authorization_code",
    code: code,
    scope: "read",
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    redirect_uri: redirectUri,
  });
  const data = await response.json();

  setAuth({ type: "mastoapi", loggedIn: true, token: data.access_token });
}

export async function revokeToken() {
  if (auth.type !== "mastoapi") throw new Error("Not logged in");

  if (auth.token && auth.clientId && auth.clientSecret) {
    try {
      await postParams("/oauth/revoke", {
        token: auth.token,
        client_id: auth.clientId,
        client_secret: auth.clientSecret,
      });
    } catch (error) {}
  }

  setAuth("type", "");
}
