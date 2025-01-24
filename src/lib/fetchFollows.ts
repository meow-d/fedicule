import { get, getNextPageUrl } from "./fetch";
import {
  Account,
  FamiliarFollower,
  FollowRaw,
  data,
  setData,
} from "../stores/data";

async function fetchFollowData(): Promise<FollowRaw> {
  if (!data.mastoAccount) {
    const mastoAccount = await getAccount();
    setData({ mastoAccount });
  }
  if (!data.mastoAccount) {
    throw new Error("Error getting current account");
  }

  const following: Account[] = await fetchRelationships(
    data.mastoAccount.id,
    "following"
  );
  const followers: Account[] = await fetchRelationships(
    data.mastoAccount.id,
    "followers"
  );

  const allAccounts: Account[] = following.concat(followers);
  const uniqueAccounts: Account[] = Array.from(
    new Map(allAccounts.map((item) => [item.id, item])).values()
  );
  const familiarFollowers = await fetchFamiliarFollowers(uniqueAccounts);

  return { following, followers, familiarFollowers };
}

async function fetchRelationships(
  id: string,
  type: "following" | "followers"
): Promise<Account[]> {
  let url: string | null = `/api/v1/accounts/${id}/${type}`;
  let accounts: Account[] = [];

  while (url) {
    const response = await get(url, { limit: 80 });
    const data: Account[] = await response.json();
    if (!response.ok) break;
    accounts = accounts.concat(data);

    url = getNextPageUrl(response.headers.link);
  }
  return accounts;
}

async function fetchFamiliarFollowers(
  accounts: Account[]
): Promise<FamiliarFollower[]> {
  const params = new URLSearchParams();
  accounts.forEach((account) => {
    params.append("id[]", account.id);
  });

  const response = await get(
    "/api/v1/accounts/familiar_followers",
    params.toString()
  );
  return await response.json();
}

async function getAccount(): Promise<Account> {
  const response = await get("/api/v1/accounts/verify_credentials");
  return await response.json();
}

export { fetchFollowData };
