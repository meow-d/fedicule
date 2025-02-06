import { get, getNextPageUrl } from "./mastoApi";
import { MastoFamiliarFollower, MastoFollowRaw } from "./types";
import { MastoAccount } from "./types";

export default async function fetchFollows(): Promise<MastoFollowRaw> {
  const user = await getAccount();

  const following = await fetchRelationships(user.id, "following");
  const followers = await fetchRelationships(user.id, "followers");

  const allAccounts = following.concat(followers);
  const uniqueAccounts = Array.from(new Map(allAccounts.map((item) => [item.id, item])).values());
  const familiarFollowers = await fetchFamiliarFollowers(uniqueAccounts);

  return { user, following, followers, familiarFollowers };
}

async function fetchRelationships(
  id: string,
  type: "following" | "followers"
): Promise<MastoAccount[]> {
  let url: string | null = `/api/v1/accounts/${id}/${type}`;
  let accounts: MastoAccount[] = [];

  while (url) {
    const response = await get(url, { limit: 80 });
    const data: MastoAccount[] = await response.json();
    accounts = accounts.concat(data);

    url = getNextPageUrl(response.headers.link);
  }
  return accounts;
}

async function fetchFamiliarFollowers(
  accounts: MastoAccount[]
): Promise<MastoFamiliarFollower[]> {
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

async function getAccount(): Promise<MastoAccount> {
  const response = await get("/api/v1/accounts/verify_credentials");
  return await response.json();
}
