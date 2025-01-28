import { get } from "./mastoApi";

export async function fetchUser(userId: string): Promise<any> {
  const response = await get(`/api/v1/accounts/${userId}`, {});
  return await response.json();
}
