import type { AppBskyActorDefs } from "@atcute/client/lexicons";
import type { Interaction, ProcessedData } from "../../stores/data";
import type { BskyFollowRaw, BskyProfileWithFollowers } from "./types";

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

  preprocessFamiliarFollowers(raw.familiarFollowers, interactions);

  return { interaction: interactions };
}

function preprocessFamiliarFollowers(familiarFollowers: BskyProfileWithFollowers[], interactions: Interaction[]) {
  familiarFollowers.forEach((receiver) => {
    receiver.knownFollowers?.forEach((account) => {
      addFollow(account, receiver, interactions);
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
