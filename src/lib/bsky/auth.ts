import {
  configureOAuth,
  resolveFromIdentity,
  createAuthorizationUrl,
  OAuthUserAgent,
  finalizeAuthorization,
  getSession,
  deleteStoredSession,
} from "@atcute/oauth-browser-client";
import { auth, setAuth } from "../../stores/authStore";
import { createRpc as updateRpc } from "./rpc";

export async function createAuthUrl(handle: string): Promise<string | URL> {
  configureOAuth({
    metadata: {
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    },
  });

  const { identity, metadata } = await resolveFromIdentity(handle);

  const authUrl = await createAuthorizationUrl({
    metadata: metadata,
    identity: identity,
    // urm i only need read permission... urm..
    // what if i do a little trolling (for legal reasons this is a joke)
    scope: "atproto transition:generic",
  });

  return authUrl;
  // TODO: user aborted message would be nice..
}

export async function finalizeAuth(url: Location) {
  const params = new URLSearchParams(url.hash.slice(1));
  const session = await finalizeAuthorization(params);
  const agent = new OAuthUserAgent(session);

  // atcute already stores credentials, so we're not doing that again
  // and theirs is 1000% better anyways
  setAuth({
    ...auth,
    loggedIn: true,
    did: agent.sub,
  });

  updateRpc();
}

export async function logout() {
  if (!auth.loggedIn || auth.type !== "bsky") return;

  const did = auth.did;
  setAuth({ ...auth, loggedIn: false });
  if (!did) return;

  try {
    const session = await getSession(did, { allowStale: true });
    const agent = new OAuthUserAgent(session);
    await agent.signOut();
  } catch (err) {
    // fallback if it fails
    deleteStoredSession(did);
  }
}
