import { auth } from "../../stores/authStore";
import { getRpc } from "./rpc";
import type { BskyFollowRaw, BskyProfileWithFollowers } from "./types";

export default async function fetchFollows(): Promise<BskyFollowRaw> {
  if (auth.type !== "bsky") throw new Error("Not logged in");

  const following = await fetchFollowing(auth.did);
  const followers = await fetchFollowers(auth.did);

  const combined = new Set([...following, ...followers]);
  combined.forEach(async (user) => {
    const knownFollowers = await fetchKnownFollowers(user.did);
    (user as BskyProfileWithFollowers).knownFollowers = knownFollowers;
  });
  const combinedArray: BskyProfileWithFollowers[] = Array.from(combined);

  return { following, followers, familiarFollowers: combinedArray };
}

async function fetchFollowing(did: string) {
  const rpc = await getRpc();
  const data = await rpc.get("app.bsky.graph.getFollows", {
    params: { actor: did },
  });
  return data.data.follows;
}

async function fetchFollowers(did: string) {
  const rpc = await getRpc();
  const data = await rpc.get("app.bsky.graph.getFollowers", {
    params: { actor: did },
  });
  return data.data.followers;
}

async function fetchKnownFollowers(did: string) {
  const rpc = await getRpc();
  const data = await rpc.get("app.bsky.graph.getKnownFollowers", {
    params: { actor: did },
  });
  return data.data.followers;
}
