import type { XRPCResponse } from "@atcute/client";
import type {
  AppBskyActorDefs,
  AppBskyGraphGetFollowers,
  AppBskyGraphGetFollows,
  AppBskyGraphGetKnownFollowers,
} from "@atcute/client/lexicons";
import type { BskyFollowRaw, BskyProfileWithFollowers } from "./types";
import { auth } from "../../stores/auth";
import { getRpc } from "./rpc";

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

async function fetchFollowing(did: `did:${string}`) {
  return paginate("app.bsky.graph.getFollows", did);
}

async function fetchFollowers(did: `did:${string}`) {
  return paginate("app.bsky.graph.getFollowers", did);
}

async function fetchKnownFollowers(did: `did:${string}`) {
  return paginate("app.bsky.graph.getKnownFollowers", did);
}

type Endpoint = "app.bsky.graph.getFollows" | "app.bsky.graph.getFollowers" | "app.bsky.graph.getKnownFollowers";
type Response = XRPCResponse<
  AppBskyGraphGetFollows.Output | AppBskyGraphGetFollowers.Output | AppBskyGraphGetKnownFollowers.Output
>;

async function paginate(endpoint: Endpoint, did: `did:${string}`) {
  const rpc = await getRpc();
  let data: AppBskyActorDefs.ProfileView[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: Response = await rpc.get(endpoint, {
      params: { actor: did, limit: 100, cursor },
    });
    if ("follows" in response.data) {
      data = data.concat(response.data.follows);
    } else if ("followers" in response.data) {
      data = data.concat(response.data.followers);
    }
    cursor = response.data.cursor;
  } while (cursor);

  return data;
}
