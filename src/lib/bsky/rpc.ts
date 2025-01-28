import { XRPC, CredentialManager } from "@atcute/client";

const manager = new CredentialManager({ service: "https://bsky.social" });
export const rpc = new XRPC({ handler: manager });
