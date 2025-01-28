import { BskyProfileWithFollowers, BskyFollowRaw } from "../../stores/data";
import { rpc } from "./rpc";

export default async function fetchFollows(
  did: string
): Promise<BskyFollowRaw> {
  const following = await fetchFollowing(did);
  const followers = await fetchFollowers(did);

  const combined = new Set([...following, ...followers]);
  combined.forEach(async (user) => {
    const knownFollowers = await fetchKnownFollowers(user.did);
    (user as BskyProfileWithFollowers).knownFollowers = knownFollowers;
  });
  const combinedArray: BskyProfileWithFollowers[] = Array.from(combined);

  return { following, followers, familiarFollowers: combinedArray };
}

async function fetchFollowing(did: string) {
  const data = await rpc.get("app.bsky.graph.getFollows", {
    params: { actor: did },
  });
  return data.data.follows;
}

async function fetchFollowers(did: string) {
  const data = await rpc.get("app.bsky.graph.getFollowers", {
    params: { actor: did },
  });
  return data.data.followers;
}

async function fetchKnownFollowers(did: string) {
  const data = await rpc.get("app.bsky.graph.getKnownFollowers", {
    params: { actor: did },
  });
  return data.data.followers;
}
