import { rpc } from "./rpc";

export async function resolveHandle(handle: string): Promise<string> {
  if (handle.startsWith("did:")) {
    return handle;
  }

  if (handle.startsWith("@")) {
    handle = handle.slice(1);
  }

  const data = await rpc.get("com.atproto.identity.resolveHandle", {
    params: { handle },
  });
  return data.data.did;
}

export async function fetchCurrentUser(did: string) {
  const data = await rpc.get("app.bsky.actor.getProfile", {
    params: { actor: did },
  });
  return data.data;
}
