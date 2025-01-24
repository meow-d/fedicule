import {
  Account,
  FamiliarFollower,
  FollowRaw,
  Interaction,
  ProcessedData,
  data,
} from "../stores/data";

export default async function preprocessFollows(
  raw: FollowRaw
): Promise<ProcessedData> {
  if (!data.mastoAccount) throw new Error("User mastodon account not found");
  const userAccount: Account = data.mastoAccount;
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
  raw: FollowRaw,
  interactions: Interaction[]
) {
  const familiarFollowers: FamiliarFollower[] = raw.familiarFollowers;
  const following: Account[] = raw.following;
  const followers: Account[] = raw.followers;

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
  sender: Account,
  receiver: Account,
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
