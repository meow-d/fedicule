import { auth } from "../../stores/authStore";

export async function post(endpoint: string, body?: Record<string, string>): Promise<any> {
  if (auth.type !== "mastoapi") throw new Error("Not logged in");

  const response = await fetch(`https://${auth.instance}${endpoint}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body) || undefined,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function postParams(endpoint: string, body?: Record<string, string>) {
  if (auth.type !== "mastoapi") throw new Error("Not logged in");

  const searchParams = new URLSearchParams(body).toString();
  const url = `https://${auth.instance}${endpoint}?${searchParams}`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function get(endpoint: string, params?: Record<string, any> | string): Promise<any> {
  if (auth.type !== "mastoapi") throw new Error("Not logged in");
  if (!auth.token) throw new Error("Not logged in (no token)");

  let paramsString;
  if (!params) {
    paramsString = "";
  } else if (typeof params === "string") {
    paramsString = `?${params}`;
  } else {
    paramsString = new URLSearchParams(params).toString();
    paramsString = `?${paramsString}`;
  }

  const url = "https://" + auth.instance + endpoint + paramsString;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(",").map((link) => link.trim());

  for (const link of links) {
    const [urlPart, relPart] = link.split(";").map((part) => part.trim());
    if (relPart === 'rel="next"') {
      return urlPart.slice(1, -1);
    }
  }

  return null;
}
