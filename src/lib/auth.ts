import { sendPostRequest } from "./sendRequest";
import { auth, setAuth } from "../stores/authStore";

async function createApp(instance: string) {
  setAuth({ instance: instance });

  const response = await sendPostRequest("/api/v1/apps", {
    client_name: auth.clientName,
    redirect_uris: auth.clientUrl,
    scopes: "read",
  });
  const data = await response.json();

  setAuth({
    instance,
    clientId: data.client_id,
    clientSecret: data.client_secret,
  });
}

async function redirectToInstance() {
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

// FIXME: cors :(
async function getToken(code: string) {
  const response = await sendPostRequest("/oauth/token", {
    grant_type: "authorization_code",
    code: code,
    scope: "read",
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    redirect_uri: auth.clientUrl,
  });
  const data = await response.json();

  setAuth({
    token: data.access_token,
    loggedIn: true,
  });
}

async function revokeToken() {
  await sendPostRequest("/oauth/revoke", {
    token: auth.token,
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
  });

  setAuth({
    token: "",
    loggedIn: false,
  });
}

export { createApp, redirectToInstance, getToken, revokeToken };
