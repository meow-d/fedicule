import { XRPC } from "@atcute/client";
import { auth } from "../../stores/auth";
import { getSession, OAuthUserAgent } from "@atcute/oauth-browser-client";

let rpc: XRPC;

export async function createRpc() {
  if (auth.type !== "bsky") throw new Error("Not logged in");

  const session = await getSession(auth.did, { allowStale: true });
  const agent = new OAuthUserAgent(session);
  rpc = new XRPC({ handler: agent });
}

export async function getRpc(): Promise<XRPC> {
  if (!rpc) await createRpc();
  return rpc;
}
