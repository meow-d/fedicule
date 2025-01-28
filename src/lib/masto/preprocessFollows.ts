import {
  MastoAccount,
  MastoFamiliarFollower,
  MastoFollowRaw,
  Interaction,
  ProcessedData,
  data,
} from "../../stores/data";

export default async function preprocessFollows(
  raw: MastoFollowRaw
): Promise<ProcessedData> {
  if (!data.mastoAccount) throw new Error("User mastodon account not found");
  const userAccount: MastoAccount = data.mastoAccount;
  const interactions: Interaction[] = [];

  raw.following.forEach((account) => {
    addFollow(userAccount, account, interactions);
  });

  raw.followers.forEach((account) => {
    addFollow(account, userAccount, interactions);
  });

  preprocessFamiliarFollowers(raw, interactions);

  return { interaction: interactions };
}

function preprocessFamiliarFollowers(
  raw: MastoFollowRaw,
  interactions: Interaction[]
) {
  const familiarFollowers: MastoFamiliarFollower[] = raw.familiarFollowers;
  const following: MastoAccount[] = raw.following;
  const followers: MastoAccount[] = raw.followers;

  familiarFollowers.forEach((familiarFollower) => {
    const receiver =
      following.find((account) => account.id === familiarFollower.id) ||
      followers.find((account) => account.id === familiarFollower.id);

    if (!receiver) {
      console.error("Account not found!!!", familiarFollower.id);
      return;
    }

    familiarFollower.accounts.forEach((account) => {
      addFollow(account, receiver, interactions);
    });
  });
}

function addFollow(
  sender: MastoAccount,
  receiver: MastoAccount,
  interactions: Interaction[]
) {
  interactions.push({
    sender: {
      label: sender.display_name,
      mastoApiId: sender.id,
      display_name: sender.display_name,
      image: sender.avatar,
    },
    receiver: {
      label: receiver.display_name,
      mastoApiId: receiver.id,
      display_name: receiver.display_name,
      image: receiver.avatar,
    },
    type: "follow",
  });
}
