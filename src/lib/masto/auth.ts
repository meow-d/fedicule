import { post, postParams } from "./mastoApi";
import { type Auth } from "../../stores/authStore";

async function createApp(instance: string, auth: Auth): Promise<Auth> {
  const response = await post("/api/v1/apps", {
    client_name: auth.clientName,
    redirect_uris: auth.clientUrl,
    scopes: "read",
  });
  const data = await response.json();

  return {
    ...auth,
    instance,
    clientId: data.client_id,
    clientSecret: data.client_secret,
  };
}

function redirectToInstance(auth: Auth) {
  if (!auth.clientId || !auth.clientSecret) {
    throw new Error("Client ID or Client Secret not found");
  }

  const params = {
    response_type: "code",
    client_id: auth.clientId,
    redirect_uri: auth.clientUrl,
    scope: "read",
  };
  const url = `https://${auth.instance}/oauth/authorize?${new URLSearchParams(
    params
  ).toString()}`;
  window.location.href = url;
}

async function getToken(code: string, auth: Auth): Promise<Auth> {
  if (!auth.clientId || !auth.clientSecret) {
    throw new Error("Client ID or Client Secret not found");
  }

  const response = await postParams("/oauth/token", {
    grant_type: "authorization_code",
    code: code,
    scope: "read",
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    redirect_uri: auth.clientUrl,
  });
  const data = await response.json();

  return {
    ...auth,
    token: data.access_token,
    loggedIn: true,
  };
}

async function revokeToken(auth: Auth): Promise<Auth> {
  if (auth.token && auth.clientId && auth.clientSecret) {
    try {
      await postParams("/oauth/revoke", {
        token: auth.token,
        client_id: auth.clientId,
        client_secret: auth.clientSecret,
      });
    } catch (error) {}
  }

  return {
    ...auth,
    loggedIn: false,
    token: undefined,
    clientId: undefined,
    clientSecret: undefined,
  };
}

export { createApp, redirectToInstance, getToken, revokeToken };
