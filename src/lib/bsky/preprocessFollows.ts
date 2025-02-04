import type { AppBskyActorDefs } from "@atcute/client/lexicons";
import type { Interaction, ProcessedData } from "../../stores/data";
import type { BskyFollowRaw } from "./types";

export default async function preprocessFollows(
  raw: BskyFollowRaw,
  user: AppBskyActorDefs.ProfileView
): Promise<ProcessedData> {
  let interactions: Interaction[] = [];

  raw.following.forEach((account) => {
    addFollow(user, account, interactions);
  });

  raw.followers.forEach((account) => {
    addFollow(account, user, interactions);
  });

  preprocessFamiliarFollowers(raw);

  return { interaction: interactions };
}

function preprocessFamiliarFollowers(raw: BskyFollowRaw) {
  const familiarFollowers = raw.familiarFollowers;
  const following = raw.following;
  const followers = raw.followers;

  familiarFollowers.forEach((familiarFollower) => {
    const receiver =
      following.find((account) => account.did === familiarFollower.did) ||
      followers.find((account) => account.did === familiarFollower.did);

    if (!receiver) {
      console.error("Account not found!!!", familiarFollower.did);
      return;
    }

    familiarFollower.knownFollowers?.forEach((account) => {
      addFollow(account, receiver, []);
    });
  });
}

function addFollow(
  sender: AppBskyActorDefs.ProfileView,
  receiver: AppBskyActorDefs.ProfileView,
  interactions: Interaction[]
) {
  interactions.push({
    sender: {
      label: sender.handle,
      bskyDid: sender.did,
      display_name: sender.displayName ? sender.displayName : sender.handle,
      image: sender.avatar ? sender.avatar : "",
    },
    receiver: {
      label: receiver.handle,
      bskyDid: receiver.did,
      display_name: receiver.displayName ? receiver.displayName : receiver.handle,
      image: receiver.avatar ? receiver.avatar : "",
    },
    type: "follow",
  });
}
