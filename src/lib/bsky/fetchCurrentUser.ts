import { auth } from "../../stores/auth";
import { getRpc } from "./rpc";

export default async function fetchCurrentUser() {
  if (auth.type !== "bsky") throw new Error("Not logged in");

  const rpc = await getRpc();
  const data = await rpc.get("app.bsky.actor.getProfile", {
    params: { actor: auth.did },
  });
  return data.data;
}
