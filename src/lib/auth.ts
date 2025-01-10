import { post, postParams } from "./sendRequest";
import { auth, setAuth } from "../stores/authStore";

async function createApp(instance: string) {
  setAuth({ instance });

  const response = await post("/api/v1/apps", {
    client_name: auth.clientName,
    redirect_uris: auth.clientUrl,
    scopes: "read",
  });
  const data = await response.json();

  setAuth({
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

async function getToken(code: string) {
  const response = await postParams("/oauth/token", {
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
  const token = auth.token;

  setAuth({
    token: "",
    loggedIn: false,
  });

  try {
    await postParams("/oauth/revoke", {
      token: token,
      client_id: auth.clientId,
      client_secret: auth.clientSecret,
    });
  } catch (error) {
    throw new Error(">:3");
  }
}

export { createApp, redirectToInstance, getToken, revokeToken };
